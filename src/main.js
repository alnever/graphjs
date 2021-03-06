import { Canvas } from './canvas.js';

/**
 * @class Graph
 *
 * Main class of the framework
 */

export default class Graph {


  /**
   * constructor -
   *
   * @param  {string} id   ID of the element to insert plot into
   * @param  {object} info  Parameters of the plot
   */
  constructor(id, info) {
    this.id = id;
    this.info = info;
  }


  /**
   * render - Method to draw a plot
   *
   * @return {void}
   */
  render() {
    let div = document.getElementById(this.id);

    this.canvas = new Canvas(div)
      .render()
      .addTitle(this.info.title)
      .addSubTitle(this.info.subtitle)
      .addPlot(this.info.series, this.info.axis_x, this.info.axis_y, this.info.options);
  }
}
