import { Title } from './title.js';
import { Axis } from './axis.js';
import { Plot } from './plot.js';

/**
 * @class Canvas - represent a main canvas of the plot
 */
export class Canvas {


  /**
   * constructor - create a canvas
   *
   * @param  {Element} plot_div a div containing the plot
   */
  constructor(plot_div) {
    this.div = plot_div;
  }


  /**
   * render - put a canvas into parent div
   *
   * @return {Canvas}  current instance of canvas
   */
  render() {
    this.canvas = document.createElement("canvas");

    this.canvas.width = this.div.offsetWidth;
    this.canvas.height = this.div.offsetHeight;

    this.div.appendChild(this.canvas);

    return this;
  }


  /**
   * addTitle - add a plot's title
   *
   * @param  {object} title - title parameters
   * @return {Canvas} - current instance of canvas
   */
  addTitle(title) {
    if (title) {
      this.title = new Title(this.canvas, title)
        .render();
    }

    return this;
  }


  /**
   * addSubTitle - add a subtitle onto the plot
   *
   * @param  {object} subtitle - plot's subtitle
   * @return {Canvas} - current instance of canvas
   */
  addSubTitle(subtitle) {
    if (subtitle) {
      this.subtile = new Title(this.canvas, subtitle)
        .render(50);
    }

    return this;
  }


  /**
   * addAxisX - add an x-axis onto the plot
   *
   * @param  {object} axis  x-axis parameters
   * @return {Canvas} current instance of canvas
   */
  addAxisX(axis) {
    if (axis) {
      this.axis_x = new Axis(this.canvas, axis, "x")
        .render();
    }
    return this;
  }


  /**
   * addAxisY - add an y-axis onto the plot
   *
   * @param  {object} axis y-axis parameters
   * @return {Canvas} current canvas instance
   */
  addAxisY(axis) {
    if (axis) {
      this.axis_y = new Axis(this.canvas, axis, "y")
        .render();
    }

    return this;
  }


  /**
   * addPlot - add a plot onto the canvas
   *
   * @param  {object} plot_data plot description
   * @return {Canvas}          current instance of canvas
   */
  addPlot(plot_data, axis_x, axis_y, global_options) {
    if (plot_data) {
      this.plot = new Plot(this.canvas, plot_data, axis_x, axis_y, global_options)
        .render();
    }

    return this;
  }

}
