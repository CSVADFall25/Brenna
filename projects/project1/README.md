Project 1 Description:

For this project I aimed to make a drawing tool specifically in a watercolor style as this is the most frequent way I personally create art. 
After some research, I became inspired by the work done by Steve's Makerspace creating watercolor painting in p5.js. I started with some of his 
code as my foundation and then built upon it. I was very focused on the color aspect of watercolor and providing as many opportunities for a 
user to play with color as they create watercolor digital art. This led me to create the color picker and corresponding color palette area for
one to store and reuse colors as they paint. Note that for this project, I did utilize Copilot and Gemini at times to help debug, research p5.js 
syntax, and help brainstorm ideas. 

Users are able to use this tool to freeely draw on the canvas part of the screen, changing the "Paint Dropper"
slider (essentially brushstroke), as well as dry or wet the painting as they see fit. One thing I've learned from doing watercolor on my own is that
it's tricky to master the amount of water to put on your brush at a time and the worse possible scenario is colors blending that you don't want to 
blend. In this digital tool, users can select the "Clear Canvas" button and start over at any time.

From experience, I know that it isn't always easy to ideate something to watercolor or know where to start, which is why I included the option
to look at a reference picture to try to replicate, similar to ArtKit. I intentionally didn't render the reference picture to start with 
because I wanted the user to have the option to freely explore if they'd prefer, before feeling pressured into creating a specific piece of art.
I included personalization based on the user's painting abilities, giving them the option to see a "Beginner", "Novice", or "Advanced" piece of 
watercolor artwork.

I also didn't want to just have a traditional watercolor tool, so I explored to see what other art effects I could perform on top of the canvas
area, when I stumbled upon p5.js has a filter() function. Depending on how its set, the art may become filtered every few seconds, switching 
between blur (almost spray paint like), posterize (limits # of colors), invert (inverts colors to their opposite), and gray (grayscale) modes.
This allows users to play around with digital art and extend upon what you can do in the physical world with regular watercolor paper and paint.
I originally was going to add a button to turn the filters on and off, but decided that I wanted to "force" it on them to see what happens.

I will say that I was a bit ambitious in this project and I wish I spent more time brainstorming at the beginning of the project as there 
were many hours debugging, refining, and redoing aspects of the project. If I had more time I would have loved to add a "Crazy Mode", something
where there are a bunch of sliders, buttons, etc. on the screen but no description of what each component changes. This way users can have fun
exploring the many options without knowing how it would impact their art. This way artists are less confined and can create more "abstract" and 
exploratory art. My aim for this project was not to create a world class watercolor tool, but rather extend an existing one and see what else I 
could add to it, taking from things we've learning in this course already. I see this tool as a fun way for individuals to play around with 
color and see how things blends on a digital screen, transferring this knowledge to watercoloring in real life. I'm curious to see my classmates
use this tool when then play around with it. Will they start creating their own art or replicate a reference image? Will they take advantage of the 
color palette and create a cohesive painting using a specific theme of colors? Will they like the filtered efffects layered on top of their watercolor?
