json.extract! place, :id, :name, :description, :lonlat, :x, :y, :created_at, :updated_at, :average_rating
json.url place_url(place, format: :json)
