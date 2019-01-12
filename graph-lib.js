var Graph = (function () {
  'use strict';

  /**
   *  Title of the plot
   */
  class Title {


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

  /**
   * Class for axis
   */
  class Axis {


    /**
     * constructor - create an axis x
     *
     * @param  {Element} canvas parent canvas element
     * @param  {array} axis     axis parameters
     * @param  {string} direction axis direction - x or y
     * @param  {array} zero coords of (0,0)
     */
    constructor(canvas, axis, direction, zero) {
      this.canvas = canvas;
      this.axis   = axis;
      this.direction = direction;
      this.zero = zero;
    }


    /**
     * render - put an axis onto the canvas
     *
     * @return {AxisX}  current axis instance
     */
    render() {

      let x_start = 0;
      let x_end   = 0;
      let y_start = 0;
      let y_end = 0;
      let title_top = 0;

      if (this.direction == "x") {
        x_start = 50;
        x_end   = this.canvas.width - 50;
        y_start = this.zero.y;
        y_end   = this.zero.y;
        title_top = this.zero.y + 20;
      } else if (this.direction == "y") {
        x_start = this.zero.x;
        x_end   = this.zero.x;
        y_start = 50;
        y_end   = this.canvas.height - 50;
        title_top = this.zero.x - 20;
      }

      let ctx = this.canvas.getContext("2d");

      ctx.beginPath();
      ctx.moveTo(x_start, y_start);
      ctx.lineTo(x_end, y_end);
      ctx.stroke();

      this.title = new Title(this.canvas, this.axis.title, this.direction)
        .render(title_top);

      return this;
    }
  }

  /**
   * Calculate ranges according the series of plots
   */
  class Range {

    /**
     * constructor -
     *
     * @param  {type} series series of plots
     */
    constructor(series) {
      this.series = series;
    }


    /**
     * getRanges - get ranges for the serie of plots
     *
     * @return {array}  mix-max values for x-y entire the series
     */
    getRanges() {
      let ranges = this.series.map(
        plot => this.calcRange(plot)
      );

      return {
        'minx': Math.min(...ranges.map(point => point.minx)),
        'maxx': Math.min(...ranges.map(point => point.maxx)),
        'miny': Math.min(...ranges.map(point => point.miny)),
        'maxy': Math.min(...ranges.map(point => point.maxy))
      }
    }


    /**
     * calcRange - calculate min-max values on x-y for the plot
     *
     * @param  {array} plot plot description with data
     * @return {array}      min-max values for x-y
     */
    calcRange(plot) {
      if (plot.type == "linear") {
        return {
          'minx': Math.min(...plot.data.map(point => point.x)),
          'maxx': Math.max(...plot.data.map(point => point.x)),
          'miny': Math.min(...plot.data.map(point => point.y)),
          'maxy': Math.max(...plot.data.map(point => point.y))
        }
      }
    }


  }

  class DataPoint {
    constructor(x, y, data_x, data_y, label) {
      this.x = x;
      this.y = y;
      this.data_x = data_x;
      this.data_y = data_y;
      this.label = label;
    }
  }

  class AbstractPlot {
    constructor() {
      
    }
  }

  class Converter {
    /**
     * convertX - convert x value into canvas coords
     *
     * @param  {number} value data value
     * @return {number}       x-coord of the point
     * @param  {array} range mix-max values of source scale
     * @param  {array} limits min-max values of destination scale
     */
    static convertX(value, range, limits) {
      let oldRange = range.maxx - range.minx;
      let newRange = limits.maxx - limits.minx;
      return (((value - range.minx) * newRange) / oldRange) + limits.minx;
    }


    /**
     * convertY - convert y value into canvas coords
     *
     * @param  {number} value data value
     * @param  {array} range mix-max values of source scale
     * @param  {array} limits min-max values of destination scale
     * @return {number}       y-coord of the point
     */
    static convertY(value, range, limits) {
      let oldRange = range.maxy - range.miny;
      let newRange = limits.maxy - limits.miny;
      return (((value - range.miny) * newRange) / oldRange) + limits.miny;
    }
  }

  class Linear extends AbstractPlot {

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

  class Plot {

    /**
     * constructor - create a plot on the canvas
     *
     * @param  {Element} canvas  parent canvas element
     * @param  {array} series collection of plots descriptions
     * @param  {array} axis_x x-axis parameters
     * @param  {array} axis_y y-axis parameters
     */
    constructor(canvas, series, axis_x, axis_y) {
      this.canvas = canvas;
      this.series = series;
      this.axis_x = axis_x;
      this.axis_y = axis_y;
    }


    /**
     * render - render a plot
     *
     * @return {Plot}  current instance of the plot
     */
    render() {
      // calc ranges entire the series
      this.ranges = new Range(this.series)
        .getRanges();

      // calculate limits
      this.limits = {
        'minx': (this.ranges.minx == 0 ? 50 : 60),
        'maxx': this.canvas.width - 60,
        'miny': (this.ranges.miny == 0 ? this.canvas.height - 50 : this.canvas.height - 60),
        'maxy': 60
      };

      // dwaw asix x and y
      this.addAxisX();
      this.addAxisY();

      // draw plots
      this.plots = this.series.map(plot => this.draw(plot));

      return this;
    }


    /**
     * draw - draw a single plot from the series
     *
     * @param  {array} plot plot description
     * @return {void}
     */
    draw(plot) {
      if (plot.type = "linear") {
        return new Linear(this.canvas, plot, this.ranges, this.limits)
          .render();
      }
    }

    /**
     * addAxisX - add x-axis to the plot
     *
     * @return {void}
     */
    addAxisX() {
      if (this.axis_x) {
        new Axis(this.canvas, this.axis_x, "x", {
          'x': Converter.convertX(0, this.ranges, this.limits),
          'y': Converter.convertY(0, this.ranges, this.limits)
        }).render();
      }
    }


    /**
     * addAxisY - add y-axis to the plot
     *
     * @return {void}
     */
    addAxisY() {
      if (this.axis_y) {
        new Axis(this.canvas, this.axis_y, "y", {
          'x': Converter.convertX(0, this.ranges, this.limits),
          'y': Converter.convertY(0, this.ranges, this.limits)
        }).render();
      }
    }
  }

  /**
   * @class Canvas - represent a main canvas of the plot
   */
  class Canvas {


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
     * @param  {array} title - title parameters
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
     * @param  {array} subtitle - plot's subtitle
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
     * @param  {array} axis  x-axis parameters
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
     * @param  {array} axis y-axis parameters
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
     * @param  {array} plot_data plot description
     * @return {Canvas}          current instance of canvas
     */
    addPlot(plot_data, axis_x, axis_y) {
      if (plot_data) {
        this.plot = new Plot(this.canvas, plot_data, axis_x, axis_y)
          .render();
      }

      return this;
    }

  }

  /**
   * @class Graph
   *
   * Main class of the framework
   */

  class Graph {


    /**
     * constructor -
     *
     * @param  {string} id   ID of the element to insert plot into
     * @param  {array} info  Parameters of the plot
     */
    constructor(id, info, direction) {
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
        // .addAxisX(this.info.axis_x)
        // .addAxisY(this.info.axis_y)
        .addPlot(this.info.series, this.info.axis_x, this.info.axis_y);
    }
  }

  return Graph;

}());
