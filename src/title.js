
/**
 *  Title of the plot
 */
export class Title {


  /**
   * constructor - create a title
   *
   * @param  {Element} canvas - parent canvas
   * @param  {array} title    - title info
   * @param  {string} direction - direction of the title - x or y
   */
  constructor(canvas, title, direction = 'x') {
    this.canvas = canvas;
    this.title  = title;
    this.direction = direction;
  }


  /**
   * render - put a title onto to the canvas
   *
   * @return {Title}  - current instance of the title
   */
  render(top = 20) {
    let x = 0;
    let y = 0;
    // calculate x/y for the title
    if (this.direction == "x") {
        x = this.canvas.width / 2;
        y = top;
    } else if (this.direction == "y") {
        x = top;
        y = this.canvas.height / 2;
    }

    // apply parameters
    let ctx = this.canvas.getContext("2d");
    ctx.font = (this.title.font ? this.title.font : "20px Arial");
    ctx.fillStyle = (this.title.color ? this.title.color : "#000");
    ctx.textAlign = "center";

    // rotate text for y axis
    if (this.direction == "y") {
      ctx.save();
      ctx.translate(x, y);
      x = 0;
      y = 0;
      ctx.rotate(-Math.PI / 2);
    }

    // drow the title
    ctx.fillText(
      this.title.text,
      x,
      y,
      this.canvas.width
    );

    if (this.direction == "y") {
      ctx.restore();
    }

    return this;
  }
}
