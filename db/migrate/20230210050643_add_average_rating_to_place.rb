class AddAverageRatingToPlace < ActiveRecord::Migration[7.0]
  def change
    add_column :places, :average_rating, :float, default: 0.0
  end
end
