
require 'rails_helper'

RSpec.describe Place, :type => :model do
    it "filters the rating for places" do
    
        NUMBER_OF_RANDOM_PLACES = 5

        # Create some random places
        NUMBER_OF_RANDOM_PLACES.times do |i|
            Place.create(name: "Random Place #{i}", description: "description of place #{i}", lonlat: "POINT(-113.43810140286973 53.564635699516764)", average_rating: 3)
        end

        expect(Place.filter_rating(3).count).to eq(5)
    end

    it "filters the rating for places < 3" do
    
        NUMBER_OF_RANDOM_PLACES = 5

        # Create some random places
        NUMBER_OF_RANDOM_PLACES.times do |i|
            Place.create(name: "Random Place #{i}", description: "description of place #{i}", lonlat: "POINT(-113.43810140286973 53.564635699516764)", average_rating: 1)
        end

        expect(Place.filter_rating(3).count).to eq(0)
    end
end