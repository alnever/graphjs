import { Axis } from './axis.js';
import { Range } from './range.js';
import { Converter } from './converter.js';

import { Linear } from './linear.js';
import { BarPlot } from './bar-plot.js';
import { Scatter } from './scatter.js';

export class Plot {

  /**
   * constructor - create a plot on the canvas
   *
   * @param  {Element} canvas  parent canvas element
   * @param  {object} series collection of plots descriptions
   * @param  {object} axis_x x-axis parameters
   * @param  {object} axis_y y-axis parameters
   * @param  {object} global_options global options for plots
   */
  constructor(canvas, series, axis_x, axis_y, global_options) {
    this.canvas = canvas;
    this.series = series;
    this.axis_x = axis_x;
    this.axis_y = axis_y;
    this.x_continuous = this.axis_x.type && this.axis_x.type == "continuous";
    this.y_continuous = this.axis_y.type && this.axis_y.type == "continuous";
    this.globalOptions = global_options;
  }


  /**
   * render - render a plot
   *
   * @return {Plot}  current instance of the plot
   */
  render() {

    if (this.x_continuous) {
      // sort series by x - for continues axis
      this.series.map(plot => this.sortData(plot.data));
    } else {
      this.unifyData();
    }

    // calc ranges entire the series
    this.ranges = new Range(
      this.series,
      this.x_continuous,
      this.y_continuous
    ).getRanges();

    console.log(this.ranges);

    // calculate limits
    this.limits = {
      'minx': (this.x_continuous && this.ranges.minx == 0 ? 50 : 60),
      'maxx': this.canvas.width - 60,
      'miny': (this.y_continuous  && this.ranges.miny == 0 ? this.canvas.height - 50 : this.canvas.height - 60),
      'maxy': 60
    }

    this.axis_limits = {
      'minx': (this.x_continuous ? this.limits.minx : 50),
      'maxx': this.canvas.width - 60,
      'miny': (this.y_continuous ? this.limits.miny : this.canvas.height - 50),
      'maxy': 60
    }

    console.log(this);

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
   * @param  {object} plot plot description
   * @return {void}
   */
  draw(plot) {
    if (plot.type == "linear") {
      return new Linear(
        this.canvas,
        plot,
        this.ranges,
        this.limits,
        this.x_continuous,
        this.y_continuous
      ).render();
    } else if (plot.type == "bar") {
      // add options for several bar plots drawn together
      let options = this.globalOptions.bars;
      options.count = this.series.length;
      options.index = this.series.indexOf(plot);

      return new BarPlot(
        this.canvas,
        plot,
        this.ranges,
        this.limits,
        this.x_continuous,
        this.y_continuous,
        options
      ).render();
    } else if (plot.type == "scatter") {
      return new Scatter(
        this.canvas,
        plot,
        this.ranges,
        this.limits,
        this.x_continuous,
        this.y_continuous
      ).render();
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
        'x': Converter.convertX(0, this.ranges, this.axis_limits),
        'y': Converter.convertY(0, this.ranges, this.axis_limits)
      }).render();
    }
  }


  /**
   * addAxisY - add y-axis to the plot
   *
   * @return {void}
   */
  addAxisY() {
    console.log(Converter.convertX(0, this.ranges, this.axis_limits));
    if (this.axis_y) {
      new Axis(this.canvas, this.axis_y, "y", {
        'x': Converter.convertX(0, this.ranges, this.axis_limits),
        'y': Converter.convertY(0, this.ranges, this.axis_limits)
      }).render();
    }
  }


  /**
   * sortData - order data in series by x axis
   * The method changes sourse data of the plot in series
   *
   * @param  {array} data data for the plot
   * @return {void}
   */
  sortData(data) {
    data = data.sort(
      (a,b) => {
        return a.x - b.x;
      }
    );
  }


  /**
   * unifyData - make common categorical scales for all plots
   * in series
   *
   * @return {void}
   */
  unifyData() {
    // get common list of categories in all series
    let xValues = [].concat(...this.series.map(
      plot => plot.data.map(point => point.x)
    ));

    // get just unique categories for all series
    let categories = [ ...new Set(xValues) ];

    // change data adding categories and reordering data in
    // series 1,2 etc...
    // ... add categories
    categories.map(
      value => {
        this.series.map(
          plot => {
            let x = plot.data.map(point => point.x);
            if (x.indexOf(value) < 0) {
              plot.data.push({
                'x': value,
                'y': 0
              })
            }
          }
        )
      }
    );

    // ... reorder data in series according categories
    this.series.map(
      plot => plot.data.sort(
        (a,b) => {
          return categories.indexOf(a.x) - categories.indexOf(b.x);
        }
      )
    );
    // finally: this.series are unified by x
  }

}
