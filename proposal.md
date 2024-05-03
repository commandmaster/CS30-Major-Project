# Major Project Proposal

## Description
With my major project, I intend to advance my understanding of game development regarding OOP, engine behaviour, modules, physics and much more. I'm going to use HTML 5 Canvas to create my project with the intent of making an easy-to-play multiplayer 2D shooter. I want snappy controls (high acceleration and deceleration) and precise air controls. It won't be top-down but rather a platformer. I want to add a twist to set apart my game from something basic. I'm intending to implement a round system with a basic economy. I want a few different characters with some special abilities that they can use.  

## Needs To Have List
- **Physics** (Maybe custom or maybe adapted Matter.js)
  - Physics Bodies
  - Matter JS as the physics engine
- **Rendering**
  - Rendering API with camera scaling
  - Animations for different player states (state machine)
- **Networking**
  - Synced Physics Bodies
  - Synced Portals and object animations
- **Abilities**
  - Have a couple abilities your character can use
- **Characters** 
  - Create 2 selectable characters with their own abilites
- **Weapons**
  - Have a small selection of wepons anyone can choose with a basic window
- **Menu's**
- **Scalability** (able to be played on multiple different resolutions)
- **Scripting System**
  - Use a scricptable entity based archeture 
- **Code Neatness**
  - Comments
  - Use of public and private methods/properties to help keep maintainability
- **Inputs**
  - Hard coded keybinds that come default with the game



## Nice To Have List
- **Networking**
  - Compression on network packets to reduce bandwidth
  - Synced Particles
  - Client Side prediction as well as authoritative server movement (with recconciliation)
- **Tutorial**
  - Teaches you how to play the game
- **Characters** 
  - Create more available selectable characters with their own abilites
- **Different Weapons**
  - Have an economy with the ability to purchase different/better weapons to gain an advantage
- **Rendering**
  - Add bloom and other post proccessing effets
  - Maybe implement a 2D material system using webGL shader (only if everything else is completed)
- **Physics**
  - Create own custom physics engine using the implicit euler method.
  - Physics Engine could have:
    - Continous collision detection using ray casting
    - Terrain collision using quadratic besier curve
    - Potential S.A.T. collison for rotated bodies allowing for proper angular forces to be applied 
- **Inputs**
  - Bindings that the user can set using a menu for each action.