use std::collections::HashMap;
use std::error::Error;
use std::fs;
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc, TimeZone};

#[derive(Debug, Deserialize)]
struct Listing {
    id: u64,
    name: Option<String>,
    neighbourhood_cleansed: String,
    room_type: String,
    price: String,
    accommodates: Option<f64>,
    bedrooms: Option<f64>,
    bathrooms: Option<f64>,
    beds: Option<f64>,
    minimum_nights: Option<f64>,
    maximum_nights: Option<f64>,
    availability_365: Option<f64>,
    review_scores_rating: Option<f64>,
    host_is_superhost: Option<String>,
    estimated_revenue_l365d: Option<f64>,
}

#[derive(Debug, Deserialize)]
struct CalendarEntry {
    listing_id: u64,
    date: String,
    available: String,
    price: String,
    adjusted_price: String,
    minimum_nights: Option<f64>,
    maximum_nights: Option<f64>,
}

#[derive(Debug, Serialize)]
struct AnalyticsSummary {
    total_listings: usize,
    cleaned_listings: usize,
    avg_price: f64,
    median_price: f64,
    model_coefficients: Vec<f64>,
    model_intercept: f64,
}

#[derive(Debug, Serialize)]
struct NeighbourhoodAnalysis {
    neighbourhood: String,
    avg_price: f64,
    count: usize,
    min_price: f64,
    max_price: f64,
}

#[derive(Debug, Serialize)]
struct RoomTypeAnalysis {
    room_type: String,
    avg_price: f64,
    count: usize,
}

#[derive(Debug, Serialize)]
struct TopRevenueListing {
    id: u64,
    occupancy_rate: f64,
    avg_price: f64,
    annual_revenue: f64,
}

#[derive(Debug, Serialize)]
struct SampleListing {
    id: u64,
    name: String,
    neighbourhood: String,
    price: f64,
    accommodates: f64,
    room_type: String,
}

#[derive(Debug, Serialize)]
struct AnalyticsResults {
    summary: AnalyticsSummary,
    neighbourhood_analysis: Vec<NeighbourhoodAnalysis>,
    room_type_analysis: Vec<RoomTypeAnalysis>,
    top_revenue_listings: Vec<TopRevenueListing>,
    sample_listings: Vec<SampleListing>,
}

fn clean_price(price_str: &str) -> Option<f64> {
    price_str.trim_start_matches('$').replace(',', "").parse().ok()
}

fn load_listings() -> Result<Vec<Listing>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path("../src/data/listings.csv")?;
    let mut listings = Vec::new();

    for result in rdr.deserialize() {
        let mut listing: Listing = result?;
        if let Some(clean_price) = clean_price(&listing.price) {
            listing.price = clean_price.to_string();
        }
        listings.push(listing);
    }

    Ok(listings)
}

fn load_calendar() -> Result<Vec<CalendarEntry>, Box<dyn Error>> {
    let mut rdr = csv::Reader::from_path("../src/data/calendar.csv")?;
    let mut entries = Vec::new();

    for result in rdr.deserialize() {
        let mut entry: CalendarEntry = result?;
        if let Some(clean_price) = clean_price(&entry.price) {
            entry.price = clean_price.to_string();
        }
        if let Some(clean_adjusted) = clean_price(&entry.adjusted_price) {
            entry.adjusted_price = clean_adjusted.to_string();
        }
        entries.push(entry);
    }

    Ok(entries)
}

fn remove_outliers_iqr(data: &[f64]) -> Vec<f64> {
    if data.is_empty() {
        return Vec::new();
    }

    let mut sorted_data = data.to_vec();
    sorted_data.sort_by(|a, b| a.partial_cmp(b).unwrap());

    let q1 = sorted_data[(sorted_data.len() as f64 * 0.25) as usize];
    let q3 = sorted_data[(sorted_data.len() as f64 * 0.75) as usize];
    let iqr = q3 - q1;
    let lower_bound = q1 - 1.5 * iqr;
    let upper_bound = q3 + 1.5 * iqr;

    data.iter()
        .filter(|&&x| x >= lower_bound && x <= upper_bound)
        .cloned()
        .collect()
}

fn preprocess_data(listings: Vec<Listing>, calendar: Vec<CalendarEntry>) -> (Vec<Listing>, Vec<CalendarEntry>) {
    // Clean listings data
    let mut cleaned_listings: Vec<Listing> = listings.into_iter()
        .filter(|l| {
            l.price.parse::<f64>().unwrap_or(0.0) > 0.0 &&
            l.accommodates.unwrap_or(0.0) > 0.0 &&
            l.bedrooms.is_some() &&
            l.bathrooms.is_some() &&
            l.minimum_nights.unwrap_or(0.0) >= 1.0 &&
            l.maximum_nights.unwrap_or(366.0) <= 365.0
        })
        .collect();

    // Remove duplicates based on id
    let mut seen_ids = std::collections::HashSet::new();
    cleaned_listings.retain(|l| seen_ids.insert(l.id));

    // Clean calendar data
    let mut cleaned_calendar: Vec<CalendarEntry> = calendar.into_iter()
        .filter(|c| {
            c.price.parse::<f64>().unwrap_or(0.0) > 0.0 &&
            c.adjusted_price.parse::<f64>().unwrap_or(0.0) > 0.0
        })
        .collect();

    // Remove duplicates based on listing_id and date
    let mut seen_calendar = std::collections::HashSet::new();
    cleaned_calendar.retain(|c| seen_calendar.insert((c.listing_id, c.date.clone())));

    // Apply outlier removal to price columns
    let listing_prices: Vec<f64> = cleaned_listings.iter()
        .filter_map(|l| l.price.parse().ok())
        .collect();

    let cleaned_listing_prices = remove_outliers_iqr(&listing_prices);

    // Filter listings to only include those with prices in the cleaned range
    let min_price = cleaned_listing_prices.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_price = cleaned_listing_prices.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

    cleaned_listings = cleaned_listings.into_iter()
        .filter(|l| {
            if let Ok(price) = l.price.parse::<f64>() {
                price >= min_price && price <= max_price
            } else {
                false
            }
        })
        .collect();

    // Apply outlier removal to calendar prices
    let calendar_prices: Vec<f64> = cleaned_calendar.iter()
        .filter_map(|c| c.price.parse().ok())
        .collect();

    let cleaned_calendar_prices = remove_outliers_iqr(&calendar_prices);

    let calendar_min_price = cleaned_calendar_prices.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let calendar_max_price = cleaned_calendar_prices.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

    cleaned_calendar = cleaned_calendar.into_iter()
        .filter(|c| {
            if let (Ok(price), Ok(adj_price)) = (c.price.parse::<f64>(), c.adjusted_price.parse::<f64>()) {
                price >= calendar_min_price && price <= calendar_max_price &&
                adj_price >= calendar_min_price && adj_price <= calendar_max_price
            } else {
                false
            }
        })
        .collect();

    (cleaned_listings, cleaned_calendar)
}

fn simple_linear_regression(x: &[f64], y: &[f64]) -> (f64, f64) {
    let n = x.len() as f64;
    let sum_x: f64 = x.iter().sum();
    let sum_y: f64 = y.iter().sum();
    let sum_xy: f64 = x.iter().zip(y.iter()).map(|(xi, yi)| xi * yi).sum();
    let sum_x2: f64 = x.iter().map(|xi| xi * xi).sum();

    let slope = (n * sum_xy - sum_x * sum_y) / (n * sum_x2 - sum_x * sum_x);
    let intercept = (sum_y - slope * sum_x) / n;

    (slope, intercept)
}

fn calculate_neighbourhood_analysis(listings: &[Listing]) -> Vec<NeighbourhoodAnalysis> {
    let mut neighbourhood_data: HashMap<String, Vec<f64>> = HashMap::new();

    for listing in listings {
        if let Ok(price) = listing.price.parse::<f64>() {
            neighbourhood_data.entry(listing.neighbourhood_cleansed.clone())
                .or_insert_with(Vec::new)
                .push(price);
        }
    }

    let mut analysis: Vec<NeighbourhoodAnalysis> = neighbourhood_data.into_iter()
        .filter(|(_, prices)| prices.len() > 10)
        .map(|(neighbourhood, prices)| {
            let avg_price = prices.iter().sum::<f64>() / prices.len() as f64;
            let min_price = prices.iter().fold(f64::INFINITY, |a, &b| a.min(b));
            let max_price = prices.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

            NeighbourhoodAnalysis {
                neighbourhood,
                avg_price: (avg_price * 100.0).round() / 100.0,
                count: prices.len(),
                min_price: min_price.round(),
                max_price: max_price.round(),
            }
        })
        .collect();

    analysis.sort_by(|a, b| b.avg_price.partial_cmp(&a.avg_price).unwrap());
    analysis
}

fn calculate_room_type_analysis(listings: &[Listing]) -> Vec<RoomTypeAnalysis> {
    let mut room_type_data: HashMap<String, Vec<f64>> = HashMap::new();

    for listing in listings {
        if let Ok(price) = listing.price.parse::<f64>() {
            room_type_data.entry(listing.room_type.clone())
                .or_insert_with(Vec::new)
                .push(price);
        }
    }

    room_type_data.into_iter()
        .map(|(room_type, prices)| {
            let avg_price = prices.iter().sum::<f64>() / prices.len() as f64;
            RoomTypeAnalysis {
                room_type,
                avg_price: (avg_price * 100.0).round() / 100.0,
                count: prices.len(),
            }
        })
        .collect()
}

fn calculate_top_revenue_listings(listings: &[Listing]) -> Vec<TopRevenueListing> {
    let mut revenue_listings: Vec<TopRevenueListing> = listings.iter()
        .filter_map(|listing| {
            if let (Some(revenue), Ok(price)) = (listing.estimated_revenue_l365d, listing.price.parse::<f64>()) {
                let occupancy_rate = (revenue / (price * 365.0)).min(1.0);
                Some(TopRevenueListing {
                    id: listing.id,
                    occupancy_rate: (occupancy_rate * 10000.0).round() / 10000.0,
                    avg_price: price,
                    annual_revenue: (revenue * 100.0).round() / 100.0,
                })
            } else {
                None
            }
        })
        .collect();

    revenue_listings.sort_by(|a, b| b.annual_revenue.partial_cmp(&a.annual_revenue).unwrap());
    revenue_listings.truncate(10);
    revenue_listings
}

fn calculate_sample_listings(listings: &[Listing]) -> Vec<SampleListing> {
    listings.iter().take(100)
        .filter_map(|listing| {
            if let (Ok(price), Some(accommodates)) = (listing.price.parse::<f64>(), listing.accommodates) {
                Some(SampleListing {
                    id: listing.id,
                    name: listing.name.clone().unwrap_or_else(|| "Unknown".to_string()),
                    neighbourhood: listing.neighbourhood_cleansed.clone(),
                    price: price.round(),
                    accommodates: accommodates.round(),
                    room_type: listing.room_type.clone(),
                })
            } else {
                None
            }
        })
        .collect()
}

fn main() -> Result<(), Box<dyn Error>> {
    println!("Loading data...");
    let listings = load_listings()?;
    let calendar = load_calendar()?;

    println!("Preprocessing data...");
    let (cleaned_listings, cleaned_calendar) = preprocess_data(listings, calendar);

    println!("Performing analysis...");

    // Calculate summary statistics
    let prices: Vec<f64> = cleaned_listings.iter()
        .filter_map(|l| l.price.parse().ok())
        .collect();

    let avg_price = prices.iter().sum::<f64>() / prices.len() as f64;
    let mut sorted_prices = prices.clone();
    sorted_prices.sort_by(|a, b| a.partial_cmp(b).unwrap());
    let median_price = sorted_prices[sorted_prices.len() / 2];

    // Simple pricing model (using accommodates as single feature for simplicity)
    let features: Vec<f64> = cleaned_listings.iter()
        .filter_map(|l| l.accommodates)
        .collect();

    let (slope, intercept) = simple_linear_regression(&features, &prices);

    // Generate analysis results
    let neighbourhood_analysis = calculate_neighbourhood_analysis(&cleaned_listings);
    let room_type_analysis = calculate_room_type_analysis(&cleaned_listings);
    let top_revenue_listings = calculate_top_revenue_listings(&cleaned_listings);
    let sample_listings = calculate_sample_listings(&cleaned_listings);

    let results = AnalyticsResults {
        summary: AnalyticsSummary {
            total_listings: cleaned_listings.len(),
            cleaned_listings: cleaned_listings.len(),
            avg_price: (avg_price * 100.0).round() / 100.0,
            median_price: median_price.round(),
            model_coefficients: vec![slope],
            model_intercept: (intercept * 100.0).round() / 100.0,
        },
        neighbourhood_analysis,
        room_type_analysis,
        top_revenue_listings,
        sample_listings,
    };

    // Write results to JSON
    let json = serde_json::to_string_pretty(&results)?;
    fs::write("../analytics_results.json", json)?;

    println!("Analysis complete! Results saved to analytics_results.json");

    Ok(())
}