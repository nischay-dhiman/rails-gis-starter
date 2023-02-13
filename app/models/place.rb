class Place < ApplicationRecord
  has_many :ratings, inverse_of: :place

  delegate :x, to: :lonlat
  delegate :y, to: :lonlat

  scope :filter_rating, ->(rating) { where("places.average_rating >= ?", rating) }

end
