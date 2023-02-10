class Place < ApplicationRecord
  has_many :ratings, inverse_of: :place

  delegate :x, to: :lonlat
  delegate :y, to: :lonlat
end
