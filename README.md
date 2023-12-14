# Infinite Library

# How To Use
Clone Repo ->
Run command 'npx vite' ->
Open local host server on browser

1. Click anywhere on screen to lock camera. Click again to unlock
2. When locked, rotate camera by moving mouse
3. Use wasd keys to move around
   
# Goal

The goal of this project was to create a procedurally generated library scene. Many of the technical aspects for this project come from a research paper published by authors Stefan Greuter, Jeremy Parker, Nigel Stewart, and Geoff Leach (see Credits). Many procedural scenes are set in outside spaces including city landscapes due to the compatibility of hashing and randomly generated buildings/natural structures. Thus, we set out to experiment how an indoors scene could be implemented with objects usually found in a library with indoor and outdoor lighting.

The aesthetic we settled on for the scene was "gothic" and "dark academia", styles very similar to the buildings found on Brown's campus. 

# Technical Implementations

In no particular order,

Procedural Generation with Frustum Culling:
Per the paper, the terrain was divided into square cells in a 2D grid. Each cell represents a proxy for content based on the calculated hash for that particular cell. This was implemented in such a way that each cell would consistently have the same hash even if the player were to step out of its range and back in. If a cell goes outside of the range of the player/camera, it gets removed from the scene but its model is recycled and used for new cells introduced into the range. This allows for a more efficient use of memory and smooth generation of terrain. 

Hashing: 

The appearance of each object is determined by a pseudo random generator seed using bitwise operation. The random number determines properties such as type of object and scale. However, its important to note that the number of each type of object is not uniformally distributed despite the random number generator. We found that favoring bookshelves over objects such as lamps helps with the appearance of a library. 

God Rays:

Using a combination of render targets and shaders, crepuscular rays were produced in post-processing. The scene with objects and the scene with light logic were separated.

Bloom:

Adding lights is computationally expensive. Using the bloom effect, another post-processing procedure, we were able to create halo light effect around the lamps that were generated in the scene. 


# Bugs & Other

No known bugs. Scene may stutter depending computer limitations.

# Credits

Created by Edrick Guerrero, Jose Garcia, Sameer Sinha, and Sannivas Reddy Nallamanikalva.

Research Paper: https://svn.sable.mcgill.ca/sable/courses/COMP763/oldpapers/greuter-03-real-time.pdf

Textures and Models: sketchfab.com



