Gyrollax
========

Add depth to your pages using device sensors and the parallax effect.

## Installation
  
    npm install gyrollax --save

## Usage
  
  Add data-z and data-back-z attributes to the elements you want to transform in space.
  The former will translate the actual element itself, whereas the later will translate
  its background. Therefore, elements need an actual background for data-back-z to work.

  ```html
  <body data-back-z="-80">
    <h1 data-z="0">Screen level</h1>
    <h2 data-z="80">Floating above</h1>
    <h3 data-z="120">Almost touching you...</h1>
    <ul>
      <li data-z="-30"> I'm behind the screen! </li>
      <li data-z="-60"> Even further behind! </li>
    </ul>
    <script src="gyrollax.js"></script>
  </body>
  ```

  ```JavaScript
  // Augment all elements on the page with the 'data-z' and 'data-back-z' attributes set
  gyrollaxify();
  // Or instantiate a tilt provider and listen to its events directly
  SmoothTiltProvider().start(function(tiltX, tiltY) {});
  ```

## License

  MIT
