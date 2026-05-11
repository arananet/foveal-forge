export interface Passage {
  words: string[]
  question: string
  correctAnswer: string
  distractors: [string, string, string]
}

function p(
  text: string,
  question: string,
  correctAnswer: string,
  distractors: [string, string, string],
): Passage {
  return { words: text.trim().split(/\s+/), question, correctAnswer, distractors }
}

export const PASSAGES: readonly Passage[] = [
  p(
    `Every morning a baker wakes before dawn to prepare fresh bread for the day. He mixes flour, water, yeast, and a pinch of salt together in a large bowl. After the dough rises, he shapes it into loaves and slides them into a hot oven. The smell of warm bread soon fills the whole street, and customers line up well before the shop opens.`,
    'What does the baker mix the ingredients in?',
    'A large bowl',
    ['A wide pan', 'A wooden box', 'A small cup'],
  ),
  p(
    `Learning a second language takes time and regular practice. Many people study grammar and vocabulary from books, but real progress often comes from speaking with others. Listening to native speakers, watching films, and reading simple texts all help the brain build new patterns. Even short daily practice of fifteen minutes can lead to strong results over several months.`,
    'How long does the passage say daily practice should be for good results?',
    'Fifteen minutes',
    ['One hour', 'Thirty minutes', 'Five minutes'],
  ),
  p(
    `The public library in our town was built more than a hundred years ago. It holds thousands of books on every subject from science to cooking. Anyone with a local address can borrow up to ten books for three weeks at no cost. The library also runs free events for children every Saturday morning during the school year.`,
    'How many books can a person borrow at once?',
    'Ten books',
    ['Five books', 'Twenty books', 'Three books'],
  ),
  p(
    `Cycling is one of the most efficient ways to travel in a city. A bicycle takes up far less space than a car and causes no air pollution. Many cities are building new cycling lanes to make riding safer for everyone. Studies show that people who cycle to work arrive feeling more alert and less stressed than those who drive or take public transport.`,
    'According to the passage, how do cyclists feel when they arrive at work?',
    'More alert and less stressed',
    ['Tired but satisfied', 'The same as drivers', 'Hungry and thirsty'],
  ),
  p(
    `Rain forests cover only a small part of the earth but they are home to more than half of all plant and animal species on the planet. The thick canopy of trees filters sunlight and creates a cool, damp world below. Many medicines used today were first discovered in rain forest plants. Scientists believe that thousands of useful species have yet to be found and studied.`,
    'What fraction of all species live in rain forests?',
    'More than half',
    ['About a quarter', 'Nearly all', 'Less than a tenth'],
  ),
  p(
    `Sleep is essential for good health and clear thinking. During sleep the brain processes the events of the day and moves important information into long-term memory. Adults generally need between seven and nine hours of sleep each night. People who sleep less than six hours regularly tend to have slower reactions, worse moods, and a higher risk of certain diseases over time.`,
    'How many hours of sleep do adults generally need each night?',
    'Seven to nine hours',
    ['Five to six hours', 'Ten to twelve hours', 'Four to five hours'],
  ),
  p(
    `Farmers markets are becoming popular again in many towns and cities. Shoppers enjoy buying fresh fruit, vegetables, and bread directly from the people who grow or make them. Prices can be higher than in a supermarket, but many customers feel the quality is better and they like knowing where their food comes from. Some markets also sell honey, cheese, flowers, and handmade crafts.`,
    'Why do some customers prefer farmers markets despite higher prices?',
    'Better quality and knowing the food source',
    ['Faster service', 'Longer opening hours', 'Free parking nearby'],
  ),
  p(
    `The ocean covers more than seventy percent of the earth surface, yet scientists have explored less than twenty percent of it. The deep sea is cold, dark, and under enormous pressure, making exploration very difficult and expensive. Robotic submarines have helped researchers discover strange new creatures that glow in the dark or survive without sunlight by feeding on chemicals from volcanic vents on the ocean floor.`,
    'What percentage of the ocean has scientists explored so far?',
    'Less than twenty percent',
    ['More than half', 'About fifty percent', 'Nearly all of it'],
  ),
] as const
