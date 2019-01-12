import { DataPoint } from './data-point.js';
import { AbstractPlot } from './abstract-plot.js';
import { Converter } from './converter.js';

export class Linear extends AbstractPlot {

  /**
   * constructor - create a linear plot
   *
   * @param  {Element} canvas parent canvas element
   * @param  {array} data   array of data points
   * @param  {array} range common range for the series of plots
   * @param  {array} limits common coords limits for the series of plots
   */
  constructor(canvas, params, range, limits) {
    super();
    this.canvas = canvas;
    this.data   = params.data;
    this.params = params;
    this.range  = range;
    this.limits = limits;
  }

  /**
   * render - render a linear plot
   *
   * @return {Linear}  current instance
   */
  render() {
    this.points = this.convertData();

    this.ctx = this.canvas.getContext("2d");

    this.plotLine();

    if (this.params.points) {
      this.addDataPoints();
    }

    if (this.params.labels && this.params.labels == "values") {
      this.addDataValues();
    }

    return this;
  }


  /**
   * convertData - convert data into plot coords
   *
   * @return {array}  array of points in plot's coord system
   */
  convertData() {

    return this.data.map(point => new DataPoint(
      Converter.convertX(point.x, this.range, this.limits),
      Converter.convertY(point.y, this.range, this.limits),
      point.x,
      point.y,
      point.label
    ));

  }

  /**
   * addDataPoints - add points onto the line
   *
   * @return {void}
   */
  addDataPoints() {
    this.points.map(point => {
      this.ctx.beginPath();
      this.ctx.arc(point.x, point.y, 5, 0, 2 * Math.PI);
      this.ctx.fillStyle = ( this.params.color ? this.params.color : "#000" );
      this.ctx.fill();
      this.ctx.lineWidth = 1;
      this.ctx.strokeStyle = ( this.params.color ? this.params.color : "#000" );
      this.ctx.stroke();
    });
  }


  /**
   * addDataValues - add subscriptions to the datapoints - values (x,y)
   *
   * @return {void}
   */
  addDataValues() {
    this.points.map(point => {
      this.ctx.textAlign = "left";
      this.ctx.fillStyle = ( this.params.color ? this.params.color : "#000" );
      this.ctx.fillText(
        `(${point.data_x},${point.data_y})`,
        point.x+10,
        point.y
      );
    });
  }


  /**
   * plotLine - plot the line
   *
   * @return {void}
   */
  plotLine() {
    this.ctx.beginPath();
    this.ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    this.ctx.strokeStyle = ( this.params.color ? this.params.color : "#000" );
    this.ctx.lineWidth = (this.params.width ? this.params.width : 1);
    this.ctx.stroke();
  }

}
