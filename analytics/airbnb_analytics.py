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
for amenity in top_amenities:
    with_amenity = listings_df[listings_df['amenities_list'].apply(lambda x: amenity in x)]['price'].mean()
    without_amenity = listings_df[listings_df['amenities_list'].apply(lambda x: amenity not in x)]['price'].mean()
    price_diff = ((with_amenity - without_amenity) / without_amenity) * 100
    print(f"{amenity}: +{price_diff:.1f}% price premium")


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
    'sample_listings': sample_listings
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

