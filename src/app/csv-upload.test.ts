import { describe, expect, it } from "vitest";
import { parseCSVToListings } from "../lib/csv-parser";

describe("CSV Upload - Split Record Handling", () => {
  it("should correctly handle split records across multiple lines", () => {
    // Sample CSV content with a split record
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,Private Bedroom/Bathroom SE Austin,2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk
to Downtown",1101753,John & Tina,,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,
785963,Bouldin Cottage,4143759,Katy,,78704,30.24784,-97.76318,Entire home/apt,248,2,131,2025-06-08,0.96,1,147,10,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe("Huge house 15mins walk\nto Downtown");
    expect(result[1].id).toBe("776649");
    expect(result[1].host_name).toBe("John & Tina");
  });

  it("should handle multiple split records", () => {
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,Private Bedroom/Bathroom SE Austin,2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk
to Downtown",1101753,John & Tina,,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,
785963,"Bouldin
Cottage",4143759,Katy,,78704,30.24784,-97.76318,Entire home/apt,248,2,131,2025-06-08,0.96,1,147,10,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(3);
    expect(result[1].name).toBe("Huge house 15mins walk\nto Downtown");
    expect(result[2].name).toBe("Bouldin\nCottage");
  });

  it("should handle records with quotes but no splits", () => {
    const csvContent = `id,name,host_id,host_name,neighbourhood_group,neighbourhood,latitude,longitude,room_type,price,minimum_nights,number_of_reviews,last_review,reviews_per_month,calculated_host_listings_count,availability_365,number_of_reviews_ltm,license
775192,"Private Bedroom/Bathroom SE Austin",2438977,David,,78741,30.23746,-97.7099,Private room,,1,2,2013-03-18,0.01,1,0,0,
776649,"Huge house 15mins walk to Downtown",1101753,"John & Tina",,78704,30.24369,-97.74169,Entire home/apt,,2,58,2019-08-04,0.39,1,0,0,`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Private Bedroom/Bathroom SE Austin");
    expect(result[1].name).toBe("Huge house 15mins walk to Downtown");
    expect(result[1].host_name).toBe("John & Tina");
  });

  it("should parse multiple listings from provided CSV data", () => {
    const csvContent = `id,listing_url,scrape_id,last_scraped,source,name,description,neighborhood_overview,picture_url,host_id,host_url,host_name,host_since,host_location,host_about,host_response_time,host_response_rate,host_acceptance_rate,host_is_superhost,host_thumbnail_url,host_picture_url,host_neighbourhood,host_listings_count,host_total_listings_count,host_verifications,host_has_profile_pic,host_identity_verified,neighbourhood,neighbourhood_cleansed,neighbourhood_group_cleansed,latitude,longitude,property_type,room_type,accommodates,bathrooms,bathrooms_text,bedrooms,beds,amenities,price,minimum_nights,maximum_nights,minimum_minimum_nights,maximum_minimum_nights,minimum_maximum_nights,maximum_maximum_nights,minimum_nights_avg_ntm,maximum_nights_avg_ntm,calendar_updated,has_availability,availability_30,availability_60,availability_90,availability_365,calendar_last_scraped,number_of_reviews,number_of_reviews_ltm,number_of_reviews_l30d,availability_eoy,number_of_reviews_ly,estimated_occupancy_l365d,estimated_revenue_l365d,first_review,last_review,review_scores_rating,review_scores_accuracy,review_scores_cleanliness,review_scores_checkin,review_scores_communication,review_scores_location,review_scores_value,license,instant_bookable,calculated_host_listings_count,calculated_host_listings_count_entire_homes,calculated_host_listings_count_private_rooms,calculated_host_listings_count_shared_rooms,reviews_per_month
5456,https://www.airbnb.com/rooms/5456,20250613040113,2025-06-13,city scrape,"Walk to 6th, Rainey St and Convention Ctr","Great central  location for walking to Convention Center, Rainey Street, East 6th Street, Downtown, Congress Ave Bats.<br /><br />  Free wifi<br /><br />No Smoking,  No pets","My neighborhood is ideally located if you want to walk to bars and restaurants downtown, East 6th Street or Rainey Street.  The Convention Center is only 3 1/2 blocks away and a quick 10 minute walk. Whole foods store located 5 blks , easily walkable.",https://a0.muscache.com/pictures/14084884/b5a35a84_original.jpg,8028,https://www.airbnb.com/users/show/8028,Sylvia,2009-02-16,"Austin, TX","I am a licensed Real Estate Broker and owner of Armadillo Realty.  I attended The University of Texas at Austin and fell in love with the small town that it was back in 1979; I have been here every since.  I love the Art, Music and Film scene here in Austin.  There is so much natural beauty to enjoy as well. I especially enjoy Barton Springs Pool in the summertime along with the Zilker Hillside theater productions. SXSW, Austin City Limits Festival and the East Austin Art Studio Tour are among my favorite events. I also enjoy a sunset cruise on my canoe to Congress bridge to see the Mexican Freetail Bats come out for their nightly feeding.  ",within a few hours,100%,92%,t,https://a0.muscache.com/im/users/8028/profile_pic/1329882962/original.jpg?aki_policy=profile_small,https://a0.muscache.com/im/users/8028/profile_pic/1329882962/original.jpg?aki_policy=profile_x_medium,East Downtown,1,2,"['email', 'phone']",t,t,Neighborhood highlights,78702,,30.26057,-97.73441,Entire guesthouse,Entire home/apt,3,1.0,1 bath,1,2,"[""Extra pillows and blankets"", ""Wifi"", ""Luggage dropoff allowed"", ""Hair dryer"", ""Dishes and silverware"", ""Heating"", ""Refrigerator"", ""Shampoo"", ""Microwave"", ""Private entrance"", ""Hot water"", ""Bed linens"", ""Air conditioning"", ""Long term stays allowed"", ""Kitchen"", ""Hangers"", ""Iron"", ""Smoke alarm"", ""Self check-in"", ""Coffee maker"", ""Exterior security cameras on property"", ""Patio or balcony"", ""Keypad"", ""Backyard"", ""Essentials"", ""HDTV with Amazon Prime Video, HBO Max, Hulu, Netflix, Roku""]",$101.00,2,90,2,2,90,90,2.0,90.0,,t,30,60,90,336,2025-06-13,711,27,0,185,33,162,16362,2009-03-08,2025-04-27,4.85,4.88,4.86,4.9,4.82,4.73,4.79,,f,1,1,0,0,3.59
5769,https://www.airbnb.com/rooms/5769,20250613040113,2025-06-13,city scrape,NW Austin Room,,Quiet neighborhood with lots of trees and good neighbors.,https://a0.muscache.com/pictures/23822033/ac946aff_original.jpg,8186,https://www.airbnb.com/users/show/8186,Elizabeth,2009-02-19,"Austin, TX","We're easygoing professionals that enjoy meeting new people.  I love martial arts, the outdoors, kayaking, live music, good food and positive people. I can converse in Spanish and can cook a mean Mexican dinner.",within an hour,100%,100%,f,https://a0.muscache.com/im/users/8186/profile_pic/1272556663/original.jpg?aki_policy=profile_small,https://a0.muscache.com/im/users/8186/profile_pic/1272556663/original.jpg?aki_policy=profile_x_medium,SW Williamson Co.,1,4,"['email', 'phone', 'work_email']",t,t,Neighborhood highlights,78729,,30.45697,-97.78422,Private room in home,Private room,2,1.0,1 shared bath,1,1,"[""Extra pillows and blankets"", ""Wifi"", ""Hair dryer"", ""Dishes and silverware"", ""Pets allowed"", ""Refrigerator"", ""Conditioner"", ""Lock on bedroom door"", ""Shampoo"", ""Private backyard"", ""Microwave"", ""Free parking on premises"", ""Single level home"", ""Portable fans"", ""Host greets you"", ""Hot water"", ""Bed linens"", ""Wine glasses"", ""Hangers"", ""Bathtub"", ""Iron"", ""Smoke alarm"", ""Central air conditioning"", ""First aid kit"", ""Fire extinguisher"", ""Ceiling fan"", ""Portable heater"", ""Body soap"", ""Exterior security cameras on property"", ""Outdoor dining area"", ""Toaster"", ""Outdoor furniture"", ""Shared patio or balcony"", ""TV with DVD player"", ""Essentials"", ""Cleaning products"", ""Central heating"", ""Dining table""]",$45.00,1,14,1,1,14,14,1.0,14.0,,t,4,4,4,4,2025-06-13,304,5,3,4,5,30,1350,2010-04-10,2025-06-08,4.91,4.91,4.87,4.91,4.94,4.77,4.92,,f,1,0,1,0,1.65
6413,https://www.airbnb.com/rooms/6413,20250613040113,2025-06-14,previous scrape,Gem of a Studio near Downtown,"Great studio apartment, perfect a single person or a couple. Available as a month-to-month rental. If you're looking for a different month than the one that's open, please ask. Just 1 mile into downtown. Convenient for walking, biking, rideshare or busing into downtown, UT campus and other central Austin spots. Walk to the 10-mile looped Town Lake Trail. Airy space with very nice amenities, fresh coffee beans and a private patio.","Travis Heights is one of the oldest neighborhoods in Austin. Our house was built in 1937. We rebuilt the apartment in 2009 (well, finished and furnished it for rental then). From the studio it's a pretty easy 1-mile walk through the neighborhood to all the shops and restaurants on South Congress.",https://a0.muscache.com/pictures/hosting/Hosting-U3RheVN1cHBseUxpc3Rpbmc6NjQxMw%3D%3D/original/924415d8-11e4-4404-8394-47b713a6c7ba.jpeg,13879,https://www.airbnb.com/users/show/13879,Todd,2009-04-17,"Austin, TX","We're a young family that likes to travel, we just don't get to enough. So we live vicariously through our visiting guests.

We run this little vacation rental apartment ourselves. As mentioned in the listing, it's located on our property. It's an above garage apartment that is completely separate from our home. We like to think it's a bit European to share our place with guests. We're very sensitive to guests' needs and give you plenty of space. We're happy to answer any questions about Austin, help you around town, make suggestions, and more if you'd like. We've lived in Austin for about 20 years and have been renting the studio for more than nine years and make improvements as we grow with it. Thank you for considering our place.

PS. No, our profile pic was not taken in Austin:)",within an hour,100%,100%,t,https://a0.muscache.com/im/users/13879/profile_pic/4f35ef11-7f37-45cf-80da-f914a6d5f451.jpg?aki_policy=profile_small,https://a0.muscache.com/im/users/13879/profile_pic/4f35ef11-7f37-45cf-80da-f914a6d5f451.jpg?aki_policy=profile_x_medium,Travis Heights,1,1,"['email', 'phone']",t,t,Neighborhood highlights,78704,,30.24885,-97.73587,Entire guesthouse,Entire home/apt,2,,1 bath,,,"[""37 inch HDTV with Amazon Prime Video, Apple TV, Disney+, Fire TV, HBO Max, Netflix, premium cable"", ""Extra pillows and blankets"", ""Clothing storage: walk-in closet"", ""Carbon monoxide alarm"", ""Wifi"", ""Oven"", ""Free street parking"", ""Hair dryer"", ""Dishes and silverware"", ""Heating"", ""Conditioner"", ""Refrigerator"", ""Baking sheet"", ""Shampoo"", ""TV"", ""Stove"", ""Changing table"", ""Microwave"", ""Free parking on premises"", ""Room-darkening shades"", ""Ethernet connection"", ""Private entrance"", ""Hot water"", ""Bed linens"", ""Wine glasses"", ""Clothing storage: closet and dresser"", ""Long term stays allowed"", ""Kitchen"", ""Dove body soap"", ""Free dryer \u2013 In building"", ""Dedicated workspace"", ""Cooking basics"", ""Gas stove"", ""Private patio or balcony"", ""Hangers"", ""Pack \u2019n play/Travel crib"", ""Iron"", ""Lake access"", ""Smoke alarm"", ""Central air conditioning"", ""Laundromat nearby"", ""Free washer \u2013 In building"", ""Fire extinguisher"", ""Hot water kettle"", ""Coffee maker"", ""Ceiling fan"", ""Coffee"", ""Outdoor dining area"", ""Toaster"", ""Outdoor furniture"", ""Books and reading material"", ""Essentials"", ""Cleaning products"", ""Dining table""]",,30,90,30,30,90,90,30.0,90.0,,t,0,0,0,0,2025-06-14,123,3,0,0,2,180,,2009-12-14,2025-03-12,4.98,4.99,4.99,4.99,4.98,4.87,4.93,,f,1,1,0,0,0.65
6448,https://www.airbnb.com/rooms/6448,20250613040113,2025-06-13,city scrape,"Secluded Studio @ Zilker - King Bed, Bright & Airy","Clean, private space with everything you need for a quiet, comfy, private stay close to Zilker Park and Barton Springs, the river, parks, trails, and downtown. King bed, vaulted ceilings, high-speed fiber internet. Quality furnishings and amenities will make you feel at home. We offer contactless check-in/checkout, if you like (and we are vaccinated).",The neighborhood is fun and funky (but quiet)! People are friendly  and you can't beat the location.,https://a0.muscache.com/pictures/airflow/Hosting-6448/original/a0ab6e9c-58ed-4d57-acb1-60cb68b068e0.jpg,14156,https://www.airbnb.com/users/show/14156,Amy,2009-04-20,"Austin, TX","We are a family of four (with teenagers, all of us vaccinated). We love our home town and location... can't beat the park, river, and downtown. We love having guests in our garage apartment... it's fun to talk to people about their lives, hometowns, and travels. We're happy to give recommendations and want you to be comfy.",within an hour,100%,96%,t,https://a0.muscache.com/im/users/14156/profile_pic/1413388190/original.jpg?aki_policy=profile_small,https://a0.muscache.com/im/users/14156/profile_pic/1413388190/original.jpg?aki_policy=profile_x_medium,Zilker,1,2,"['email', 'phone']",t,t,Neighborhood highlights,78704,,30.26034,-97.76487,Entire guesthouse,Entire home/apt,2,1.0,1 bath,1,2,"[""Extra pillows and blankets"", ""Carbon monoxide alarm"", ""Wifi"", ""Oven"", ""Free street parking"", ""Luggage dropoff allowed"", ""Hair dryer"", ""Dishes and silverware"", ""Mini fridge"", ""Refrigerator"", ""Conditioner"", ""Babysitter recommendations"", ""Baking sheet"", ""Outlet covers"", ""Shampoo"", ""TV"", ""Stove"", ""Changing table"", ""Microwave"", ""Free parking on premises"", ""Room-darkening shades"", ""Ethernet connection"", ""Private entrance"", ""Hot water"", ""Bed linens"", ""Wine glasses"", ""Clothing storage: closet and dresser"", ""Long term stays allowed"", ""Kitchen"", ""Shower gel"", ""Free dryer \u2013 In building"", ""Dedicated workspace"", ""Cooking basics"", ""Private patio or balcony"", ""Hangers"", ""Pack \u2019n play/Travel crib"", ""Iron"", ""Essentials"", ""Board games"", ""Smoke alarm"", ""Central air conditioning"", ""Laundromat nearby"", ""Children\u2019s books and toys"", ""First aid kit"", ""Self check-in"", ""Free washer \u2013 In building"", ""Fire extinguisher"", ""Crib"", ""Hot water kettle"", ""Coffee maker"", ""Ceiling fan"", ""Body soap"", ""Private backyard \u2013 Fully fenced"", ""Outdoor dining area"", ""Toaster"", ""Outdoor furniture"", ""Keypad"", ""Record player"", ""Cleaning products"", ""Central heating"", ""Dining table""]",$155.00,3,365,3,3,1125,1125,3.0,1125.0,,t,10,33,62,312,2025-06-13,338,15,1,149,20,90,13950,2011-09-06,2025-05-31,4.97,4.97,4.96,4.99,4.98,4.97,4.88,,t,1,1,0,0,2.02
8502,https://www.airbnb.com/rooms/8502,20250613040113,2025-06-13,city scrape,Woodland Studio Lodging,Studio rental on lower level of home located in a 1950s neighborhood less than two miles from downtown Austin and close to bus routes.<br /><br />On stays less than 30 nights additional Austin city hotel taxes of 11% will be collected separately following confirmation of reservation.<br /><br />Texas state hotel taxes will be collected by Airbnb.<br /><br />Hotel taxes apply for all stays of 29 nights or less.  No hotel taxes are charged for rentals of 30 nights or more.,,https://a0.muscache.com/pictures/miso/Hosting-8502/original/be48ea3b-6d8a-4d9b-bc13-8aa514ef246a.jpeg,25298,https://www.airbnb.com/users/show/25298,Karen,2009-07-11,"Austin, TX","I handle the reservations at the studio on the lower level of a house that belongs to a good friend of mine.  I really enjoy this part of town, and it is great to be offering comfortable & homey lodging for people coming from around the world to experience Austin.",within a day,80%,50%,f,https://a0.muscache.com/im/users/25298/profile_pic/1330879914/original.jpg?aki_policy=profile_small,https://a0.muscache.com/im/users/25298/profile_pic/1330879914/original.jpg?aki_policy=profile_x_medium,East Riverside,1,1,"['email', 'phone']",t,f,,78741,,30.23466,-97.73682,Entire guest suite,Entire home/apt,2,1.0,1 bath,1,1,"[""Shampoo"", ""Kitchen"", ""Wifi"", ""Free street parking"", ""Smoke alarm"", ""Central air conditioning"", ""Host greets you"", ""Hot water"", ""Hair dryer"", ""Essentials"", ""Heating"", ""Pets allowed""]",$43.00,4,90,4,14,90,90,6.8,90.0,,t,18,48,78,98,2025-06-13,54,1,0,98,2,8,344,2010-02-19,2025-05-05,4.57,4.55,4.67,4.85,4.88,4.69,4.63,,f,1,1,0,0,0.29`;

    const result = parseCSVToListings(csvContent);

    expect(result).toHaveLength(5);

    // Verify first listing
    expect(result[0].id).toBe("5456");
    expect(result[0].name).toBe("Walk to 6th, Rainey St and Convention Ctr");
    expect(result[0].host_id).toBe("8028");
    expect(result[0].host_name).toBe("Sylvia");
    expect(result[0].neighbourhood_group_cleansed).toBe("");
    expect(result[0].neighbourhood).toBe("Neighborhood highlights");
    expect(result[0].latitude).toBe("30.26057");
    expect(result[0].longitude).toBe("-97.73441");
    expect(result[0].room_type).toBe("Entire home/apt");
    expect(result[0].price).toBe("$101.00");
    expect(result[0].minimum_nights).toBe("2");
    expect(result[0].number_of_reviews).toBe("711");
    expect(result[0].last_review).toBe("2025-04-27");
    expect(result[0].reviews_per_month).toBe("3.59");
    expect(result[0].calculated_host_listings_count).toBe("1");
    expect(result[0].availability_365).toBe("336");
    expect(result[0].number_of_reviews_ltm).toBe("27");
    expect(result[0].license).toBe("");

    // Verify second listing
    expect(result[1].id).toBe("5769");
    expect(result[1].name).toBe("NW Austin Room");
    expect(result[1].room_type).toBe("Private room");
    expect(result[1].price).toBe("$45.00");

    // Verify third listing (with empty price)
    expect(result[2].id).toBe("6413");
    expect(result[2].name).toBe("Gem of a Studio near Downtown");
    expect(result[2].price).toBe("");

    // Verify fourth listing
    expect(result[3].id).toBe("6448");
    expect(result[3].name).toBe("Secluded Studio @ Zilker - King Bed, Bright & Airy");
    expect(result[3].price).toBe("$155.00");

    // Verify fifth listing
    expect(result[4].id).toBe("8502");
    expect(result[4].name).toBe("Woodland Studio Lodging");
    expect(result[4].price).toBe("$43.00");
  });
});
