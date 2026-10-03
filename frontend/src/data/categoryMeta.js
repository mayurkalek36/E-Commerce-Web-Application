export const CATEGORIES = [
  'Electronics',
  'Mobiles',
  'Fashion',
  'Home & Kitchen',
  'Appliances',
  'Beauty',
  'Sports',
  'Books',
  'Gifts',
  'Grocery'
]

export const CATEGORY_ICONS = {
  Electronics: 'fa-headphones-simple',
  Mobiles: 'fa-mobile-screen-button',
  Fashion: 'fa-shoe-prints',
  'Home & Kitchen': 'fa-blender',
  Appliances: 'fa-plug',
  Beauty: 'fa-spa',
  Sports: 'fa-dumbbell',
  Books: 'fa-book',
  Gifts: 'fa-gift',
  Grocery: 'fa-basket-shopping'
}

export const CATEGORY_COLORS = {
  Electronics: 'linear-gradient(135deg,#3B4B63,#1F2A3B)',
  Mobiles: 'linear-gradient(135deg,#2E5C6E,#173842)',
  Fashion: 'linear-gradient(135deg,#6E4B2A,#4A3319)',
  'Home & Kitchen': 'linear-gradient(135deg,#3E5C4A,#25392F)',
  Appliances: 'linear-gradient(135deg,#5A5A5A,#333333)',
  Beauty: 'linear-gradient(135deg,#8A4A6E,#5C2E48)',
  Sports: 'linear-gradient(135deg,#3B5A2A,#243A19)',
  Books: 'linear-gradient(135deg,#4A3F6E,#2E2848)',
  Gifts: 'linear-gradient(135deg,#8A5A3B,#5C3B26)',
  Grocery: 'linear-gradient(135deg,#5C7A3B,#3A4F26)'
}

export function categoryIcon(category) {
  return CATEGORY_ICONS[category] || 'fa-box'
}

export function categoryColor(category) {
  return CATEGORY_COLORS[category] || 'linear-gradient(135deg,#3B4B63,#1F2A3B)'
}