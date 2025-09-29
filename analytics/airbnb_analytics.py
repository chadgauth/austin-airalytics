#!/usr/bin/env python
# coding: utf-8

# # Airbnb Analytics MVP
# 
# This notebook implements a lean Python MVP for Airbnb analytics:
# - Optimize pricing
# - Visualize the market
# - Forecast revenue
# 
# Results are exported for integration with Next.js app.

# In[1]:


# Import required libraries
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
import lightgbm as lgb
import shap
import warnings
warnings.filterwarnings('ignore')

# Set matplotlib to use non-interactive backend to prevent GUI windows
import matplotlib
matplotlib.use('Agg')

# Set style for plots
plt.style.use('seaborn-v0_8')
sns.set_palette('husl')


# In[18]:


# Load data
# Note: Adjust paths if running from different directory
listings_df = pd.read_csv('../src/data/listings.csv')
calendar_df = pd.read_csv('../src/data/calendar.csv')

print('Listings shape:', listings_df.shape)
print('Calendar shape:', calendar_df.shape)
print('\nListings columns:', list(listings_df.columns))
print('\nCalendar columns:', list(calendar_df.columns))


# In[19]:


# Data preprocessing

# Clean price columns
listings_df['price'] = listings_df['price'].str.replace('$', '').str.replace(',', '').astype(float)
calendar_df['price'] = calendar_df['price'].str.replace('$', '').str.replace(',', '').astype(float)
calendar_df['adjusted_price'] = calendar_df['adjusted_price'].str.replace('$', '').str.replace(',', '').astype(float)

# Convert date
calendar_df['date'] = pd.to_datetime(calendar_df['date'])

# Create occupied column early
calendar_df['occupied'] = calendar_df['available'] == 'f'

# Handle missing values - drop rows with missing critical fields
listings_df = listings_df.dropna(subset=['price', 'accommodates', 'bedrooms', 'bathrooms'])
calendar_df = calendar_df.dropna(subset=['price', 'date', 'available'])

# Remove invalid prices (negative or zero)
listings_df = listings_df[listings_df['price'] > 0]
calendar_df = calendar_df[calendar_df['price'] > 0]
calendar_df = calendar_df[calendar_df['adjusted_price'] > 0]

# Remove duplicates
listings_df = listings_df.drop_duplicates(subset=['id'])
calendar_df = calendar_df.drop_duplicates(subset=['listing_id', 'date'])

# Outlier removal using IQR method (more robust than percentile)
def remove_outliers_iqr(df, column):
    Q1 = df[column].quantile(0.25)
    Q3 = df[column].quantile(0.75)
    IQR = Q3 - Q1
    lower_bound = Q1 - 1.5 * IQR
    upper_bound = Q3 + 1.5 * IQR
    return df[(df[column] >= lower_bound) & (df[column] <= upper_bound)]

# Apply outlier removal to price columns
listings_df = remove_outliers_iqr(listings_df, 'price')
calendar_df = remove_outliers_iqr(calendar_df, 'price')
calendar_df = remove_outliers_iqr(calendar_df, 'adjusted_price')

# Additional cleaning for listings
listings_df = listings_df[listings_df['accommodates'] > 0]
listings_df = listings_df[listings_df['minimum_nights'] >= 1]
listings_df = listings_df[listings_df['maximum_nights'] <= 365]

print('After cleaning - Listings shape:', listings_df.shape)
print('After cleaning - Calendar shape:', calendar_df.shape)
print('Price range - Listings:', f"${listings_df['price'].min():.2f} - ${listings_df['price'].max():.2f}")
print('Price range - Calendar:', f"${calendar_df['price'].min():.2f} - ${calendar_df['price'].max():.2f}")


# ## Pricing Optimization
# 
# Use linear regression to predict optimal price based on property features.

# In[20]:


# Prepare features for pricing model
features = ['accommodates', 'bedrooms', 'bathrooms', 'beds', 'minimum_nights', 'maximum_nights']
X = listings_df[features].fillna(0)
y = listings_df['price']

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = LinearRegression()
model.fit(X_train, y_train)

# Predict and evaluate
y_pred = model.predict(X_test)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)

print(f'RMSE: ${rmse:.2f}')
print('Model coefficients:')
for feature, coef in zip(features, model.coef_):
    print(f'{feature}: ${coef:.2f}')


# ## Market Visualization

# In[21]:


# Price distribution (commented out to prevent GUI)
# plt.figure(figsize=(10, 6))
# plt.hist(listings_df['price'], bins=50, alpha=0.7, edgecolor='black')
# plt.title('Distribution of Listing Prices')
# plt.xlabel('Price ($)')
# plt.ylabel('Frequency')
# plt.show()

# Price by room type (commented out to prevent GUI)
# plt.figure(figsize=(10, 6))
# sns.boxplot(x='room_type', y='price', data=listings_df)
# plt.title('Price Distribution by Room Type')
# plt.xticks(rotation=45)
# plt.show()

# Average price over time
monthly_avg = calendar_df.groupby(calendar_df['date'].dt.to_period('M'))['price'].mean()

# Price over time plot (commented out to prevent GUI)
# plt.figure(figsize=(12, 6))
# monthly_avg.plot()
# plt.title('Average Price Over Time')
# plt.xlabel('Month')
# plt.ylabel('Average Price ($)')
# plt.show()


# In[29]:


# Price by room type (commented out to prevent GUI)
# plt.figure(figsize=(10, 6))
# sns.boxplot(x='room_type', y='price', data=listings_df)
# plt.title('Price Distribution by Room Type')
# plt.xticks(rotation=45)
# plt.show()

# Price by location (commented out to prevent GUI)
# plt.figure(figsize=(12, 8))
# plt.scatter(listings_df['longitude'], listings_df['latitude'],
#            c=listings_df['price'], cmap='viridis', alpha=0.6, s=50)
# plt.colorbar(label='Price ($)')
# plt.title('Price Distribution by Location')
# plt.xlabel('Longitude')
# plt.ylabel('Latitude')
# plt.show()

# Average price by neighborhood
neighborhood_avg = listings_df.groupby('neighbourhood_cleansed')['price'].agg(['mean', 'count', 'std'])
neighborhood_avg = neighborhood_avg[neighborhood_avg['count'] > 10].sort_values('mean', ascending=False)
print("Top 10 most expensive neighborhoods:")
print(neighborhood_avg.head(10))

# Daily occupancy patterns
calendar_df['day_of_week'] = calendar_df['date'].dt.day_name()
calendar_df['month'] = calendar_df['date'].dt.month_name()

weekly_pattern = calendar_df.groupby('day_of_week')['occupied'].mean().reindex(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
monthly_pattern = calendar_df.groupby('month')['occupied'].mean()

# Occupancy patterns plots (commented out to prevent GUI)
# fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 6))
# weekly_pattern.plot(kind='bar', ax=ax1, title='Occupancy by Day of Week')
# monthly_pattern.plot(kind='bar', ax=ax2, title='Occupancy by Month')
# plt.tight_layout()
# plt.show()


# In[30]:


# Average price over time
monthly_avg = calendar_df.groupby(calendar_df['date'].dt.to_period('M'))['price'].mean()

plt.figure(figsize=(12, 6))
monthly_avg.plot()
plt.title('Average Price Over Time')
plt.xlabel('Month')
plt.ylabel('Average Price ($)')
plt.show()


from collections import Counter
import ast

# Parse amenities (assuming it's stored as string list)
listings_df['amenities_list'] = listings_df['amenities'].apply(lambda x: ast.literal_eval(x) if isinstance(x, str) else [])

# Most common amenities
all_amenities = [amenity for sublist in listings_df['amenities_list'] for amenity in sublist]
amenity_counts = Counter(all_amenities)
print("Top 20 most common amenities:")
for amenity, count in amenity_counts.most_common(20):
    print(f"{amenity}: {count}")

# Price impact of top amenities
top_amenities = [amenity for amenity, _ in amenity_counts.most_common(10)]
amenity_impact = []
for amenity in top_amenities:
    with_amenity = listings_df[listings_df['amenities_list'].apply(lambda x: amenity in x)]['price'].mean()
    without_amenity = listings_df[listings_df['amenities_list'].apply(lambda x: amenity not in x)]['price'].mean()
    price_diff_pct = ((with_amenity - without_amenity) / without_amenity) * 100
    count_with = listings_df['amenities_list'].apply(lambda x: amenity in x).sum()
    count_without = len(listings_df) - count_with

    # Calculate confidence interval using standard error
    se = np.sqrt((with_amenity**2 / count_with) + (without_amenity**2 / count_without))
    ci_lower = price_diff_pct - 1.96 * se / without_amenity * 100
    ci_upper = price_diff_pct + 1.96 * se / without_amenity * 100

    amenity_impact.append({
        'amenity': amenity,
        'uplift_pct': round(price_diff_pct, 2),
        'ci_lower': round(ci_lower, 2),
        'ci_upper': round(ci_upper, 2),
        'count_with': int(count_with),
        'count_without': int(count_without),
        'avg_price_with': round(with_amenity, 2),
        'avg_price_without': round(without_amenity, 2)
    })
    print(f"{amenity}: +{price_diff_pct:.1f}% price premium (95% CI: {ci_lower:.1f}% to {ci_upper:.1f}%)")


# ## Revenue Forecasting
# 
# Simple forecasting based on historical occupancy and pricing.

# In[31]:


# Calculate occupancy rate (occupied column already created earlier)
occupancy_rate = calendar_df.groupby(calendar_df['date'].dt.to_period('M'))['occupied'].mean()

# Calculate potential revenue
monthly_revenue = monthly_avg * occupancy_rate * 30  # Assuming 30 days per month

# Revenue plot (commented out to prevent GUI)
# plt.figure(figsize=(12, 6))
# monthly_revenue.plot()
# plt.title('Estimated Monthly Revenue')
# plt.xlabel('Month')
# plt.ylabel('Revenue ($)')
# plt.show()

print('Average monthly revenue:', monthly_revenue.mean())


# Host metrics
host_stats = listings_df.groupby('host_id').agg({
    'price': ['mean', 'count'],
    'review_scores_rating': 'mean',
    'number_of_reviews': 'sum'
}).round(2)

host_stats.columns = ['avg_price', 'listing_count', 'avg_rating', 'total_reviews']
host_stats = host_stats.sort_values('listing_count', ascending=False)

print("Top hosts by listing count:")
print(host_stats.head(10))

# Superhost vs regular host comparison
superhost_stats = listings_df.groupby('host_is_superhost').agg({
    'price': 'mean',
    'review_scores_rating': 'mean',
    'availability_365': 'mean'
})
print("\nSuperhost vs Regular Host Comparison:")
print(superhost_stats)


# ## Export Results for Next.js Integration

# In[32]:


# Calculate neighbourhood analysis
neighbourhood_analysis = []
for neighbourhood, group in listings_df.groupby('neighbourhood_cleansed'):
    neighbourhood_analysis.append({
        'neighbourhood': neighbourhood,
        'avg_price': round(group['price'].mean(), 2),
        'count': len(group),
        'min_price': int(group['price'].min()),
        'max_price': int(group['price'].max())
    })

# Sort by average price descending
neighbourhood_analysis.sort(key=lambda x: x['avg_price'], reverse=True)

# Calculate room type analysis
room_type_analysis = []
for room_type, group in listings_df.groupby('room_type'):
    room_type_analysis.append({
        'room_type': room_type,
        'avg_price': round(group['price'].mean(), 2),
        'count': len(group)
    })

# Calculate top revenue listings
top_revenue_listings = []
for _, row in listings_df.nlargest(10, 'estimated_revenue_l365d')[['id', 'estimated_revenue_l365d', 'price']].iterrows():
    # Calculate approximate occupancy rate
    occupancy_rate = min(1.0, row['estimated_revenue_l365d'] / (row['price'] * 365))
    top_revenue_listings.append({
        'id': int(row['id']),
        'occupancy_rate': round(occupancy_rate, 4),
        'avg_price': int(row['price']),
        'annual_revenue': round(row['estimated_revenue_l365d'], 2)
    })

# Get sample listings
sample_listings = []
for _, row in listings_df.head(100)[['id', 'name', 'neighbourhood_cleansed', 'price', 'accommodates', 'room_type']].iterrows():
    sample_listings.append({
        'id': int(row['id']),
        'name': row['name'] if pd.notna(row['name']) else 'Unknown',
        'neighbourhood': row['neighbourhood_cleansed'],
        'price': int(row['price']),
        'accommodates': int(row['accommodates']),
        'room_type': row['room_type']
    })

# Hedonic regression for amenity effects (log-linear model)
import statsmodels.api as sm

# Prepare data for hedonic regression
hedonic_df = listings_df.copy()

# Create dummy variables for amenities (top 10 to avoid multicollinearity)
top_amenities = [amenity for amenity, _ in amenity_counts.most_common(10)]
for amenity in top_amenities:
    hedonic_df[f'amenity_{amenity.replace(" ", "_").replace("-", "_")}'] = hedonic_df['amenities_list'].apply(lambda x: 1 if amenity in x else 0)

# Create neighborhood fixed effects (limit to top neighborhoods)
top_neighborhoods = hedonic_df['neighbourhood_cleansed'].value_counts().head(10).index
hedonic_df['neighbourhood_cleansed'] = hedonic_df['neighbourhood_cleansed'].apply(lambda x: x if x in top_neighborhoods else 'Other')
neighborhood_dummies = pd.get_dummies(hedonic_df['neighbourhood_cleansed'], prefix='neigh', drop_first=True)

# Prepare features
hedonic_features = ['accommodates', 'bedrooms', 'bathrooms', 'beds'] + [f'amenity_{amenity.replace(" ", "_").replace("-", "_")}' for amenity in top_amenities] + list(neighborhood_dummies.columns)
X_hedonic = pd.concat([hedonic_df[['accommodates', 'bedrooms', 'bathrooms', 'beds']], hedonic_df[[f'amenity_{amenity.replace(" ", "_").replace("-", "_")}' for amenity in top_amenities]], neighborhood_dummies], axis=1)
X_hedonic = X_hedonic.fillna(0).astype(float)  # Fill NaN and ensure all columns are numeric
X_hedonic = sm.add_constant(X_hedonic)
y_hedonic = np.log(hedonic_df['price'])

# Fit hedonic model
hedonic_model = sm.OLS(y_hedonic, X_hedonic).fit()

# Extract amenity coefficients and convert to percentage uplift
amenity_coefficients = {}
for amenity in top_amenities:
    col_name = f'amenity_{amenity.replace(" ", "_").replace("-", "_")}'
    if col_name in hedonic_model.params.index:
        coef = hedonic_model.params[col_name]
        uplift_pct = (np.exp(coef) - 1) * 100
        p_value = hedonic_model.pvalues[col_name]
        amenity_coefficients[amenity] = {
            'coefficient': round(coef, 4),
            'uplift_pct': round(uplift_pct, 2),
            'p_value': round(p_value, 4),
            'significant': bool(p_value < 0.05)
        }

print("\nHedonic Regression Results - Amenity Effects:")
for amenity, stats in amenity_coefficients.items():
    sig_marker = "*" if stats['significant'] else ""
    print(f"{amenity}: {stats['uplift_pct']:.1f}% uplift (coef={stats['coefficient']}, p={stats['p_value']:.3f}){sig_marker}")

# LightGBM model with SHAP for feature importance
print("\nTraining LightGBM model for feature importance...")

# Prepare features for LightGBM
lgb_features = ['accommodates', 'bedrooms', 'bathrooms', 'beds', 'review_scores_rating', 'number_of_reviews'] + [f'amenity_{amenity.replace(" ", "_").replace("-", "_")}' for amenity in top_amenities[:10]]
X_lgb = hedonic_df[lgb_features].fillna(0)
y_lgb = hedonic_df['price']

# Split data
X_train_lgb, X_test_lgb, y_train_lgb, y_test_lgb = train_test_split(X_lgb, y_lgb, test_size=0.2, random_state=42)

# Train LightGBM
lgb_model = lgb.LGBMRegressor(n_estimators=100, learning_rate=0.1, random_state=42)
lgb_model.fit(X_train_lgb, y_train_lgb)

# SHAP analysis
explainer = shap.TreeExplainer(lgb_model)
shap_values = explainer.shap_values(X_test_lgb)

# Get feature importance
feature_importance = pd.DataFrame({
    'feature': X_lgb.columns,
    'importance': lgb_model.feature_importances_,
    'shap_mean_abs': np.abs(shap_values).mean(axis=0)
}).sort_values('importance', ascending=False)

print("Top 10 features by importance:")
print(feature_importance.head(10))

# SHAP summary for top amenities
amenity_shap = {}
for i, feature in enumerate(X_lgb.columns):
    if feature.startswith('amenity_'):
        amenity_name = feature.replace('amenity_', '').replace('_', ' ')
        amenity_shap[amenity_name] = {
            'shap_value': round(np.abs(shap_values[:, i]).mean(), 4),
            'feature_importance': int(lgb_model.feature_importances_[i])
        }

print("\nSHAP values for amenities:")
for amenity, values in sorted(amenity_shap.items(), key=lambda x: x[1]['shap_value'], reverse=True):
    print(f"{amenity}: SHAP={values['shap_value']}, Importance={values['feature_importance']}")

# Export complete analytics data to JSON
results = {
    'summary': {
        'total_listings': len(listings_df),
        'cleaned_listings': len(listings_df),
        'avg_price': round(listings_df['price'].mean(), 2),
        'median_price': int(listings_df['price'].median()),
        'model_coefficients': list(model.coef_),
        'model_intercept': round(model.intercept_, 2)
    },
    'neighbourhood_analysis': neighbourhood_analysis,
    'room_type_analysis': room_type_analysis,
    'top_revenue_listings': top_revenue_listings,
    'sample_listings': sample_listings,
    'amenity_impact': amenity_impact,
    'hedonic_coefficients': {k: {kk: float(vv) if isinstance(vv, (int, float)) else vv for kk, vv in v.items()} for k, v in amenity_coefficients.items()},
    'feature_importance': feature_importance.to_dict('records'),
    'amenity_shap': {k: {kk: float(vv) for kk, vv in v.items()} for k, v in amenity_shap.items()}
}

import json
with open('../analytics_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print('Complete analytics results exported to analytics_results.json')
print('Summary:', json.dumps(results['summary'], indent=2))


# Price elasticity analysis
listings_df['price_category'] = pd.qcut(listings_df['price'], q=5, labels=['Very Low', 'Low', 'Medium', 'High', 'Very High'])

occupancy_by_price = listings_df.groupby('price_category').agg({
    'availability_365': lambda x: (365 - x).mean(),  # Estimated annual occupancy
    'review_scores_rating': 'mean'
})

print("Occupancy and Rating by Price Category:")
print(occupancy_by_price)

# Revenue optimization
occupancy_by_price['estimated_revenue'] = occupancy_by_price['availability_365'] * listings_df.groupby('price_category')['price'].mean()
print("\nEstimated Annual Revenue by Price Category:")
print(occupancy_by_price['estimated_revenue'])


# In[33]:


# Export processed data for visualization
listings_export = listings_df[['id', 'name', 'room_type', 'price', 'accommodates', 'bedrooms', 'bathrooms']].head(100)
listings_export.to_csv('listings_sample.csv', index=False)

calendar_export = calendar_df.groupby(calendar_df['date'].dt.to_period('M')).agg({
    'price': 'mean',
    'occupied': 'mean'
}).reset_index()
calendar_export['date'] = calendar_export['date'].astype(str)
calendar_export.to_csv('monthly_stats.csv', index=False)

print('Sample data exported for Next.js integration')

# Rating distribution (commented out to prevent GUI)
# plt.figure(figsize=(10, 6))
# plt.hist(listings_df['review_scores_rating'].dropna(), bins=20, alpha=0.7, edgecolor='black')
# plt.title('Distribution of Review Scores')
# plt.xlabel('Rating')
# plt.ylabel('Frequency')
# plt.show()

# Correlation between ratings and other factors
rating_corr = listings_df[['review_scores_rating', 'price', 'accommodates', 'bedrooms', 'bathrooms']].corr()
print("Correlations with Review Scores:")
print(rating_corr['review_scores_rating'].sort_values(ascending=False))

