class CreateRatings < ActiveRecord::Migration[7.0]
  def change
    create_table :ratings do |t|
      t.integer :stars, default: 0
      t.belongs_to :place, null: false, foreign_key: true

      t.timestamps
    end
  end
end
