# Set cheat

It's a Set bot designed for set with friends. So you can cheat on your friends :)

## Rules of Set

Choose 3 cards such that:

- the number of figures either all match or are all different
- the shape of figures either all match or are all different
- the color of figures either all match or are all different
- the fill of figures either all match or are all different

## Solution

I put on a bruteforce solution where you explore the 220 possibilities each time there are new cards introduced on the floor. Give each of the properties a number where
for colors: Red = 1, Purple = 2, Green = 3
for fill: Transparent = 1, shaded = 2, filled = 3
for shape: squiggle = 1, diamond = 2, oval = 3

Notice how all the numbers are 3 or less, I used that fact to use a 4 bit number where the values are OR'ed against the nth bit. (e.x. card_color = 3, color_4bit_number = $1000_2$). This way I could easily check for all same or all different by checking if the final number for each property is $1110_2$ which is 14 or is a power of 2.
