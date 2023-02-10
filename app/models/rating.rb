class Rating < ApplicationRecord
  belongs_to :place, inverse_of: :ratings
  after_commit :update_place

  def update_place
    average_rating = if(place.ratings.count > 0)
      place.ratings.pluck(:stars).sum() / (place.ratings.count * 1.0)
    else
      0.0
    end
    place.update(average_rating: average_rating)
  end
end
