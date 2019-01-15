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
     * @param  {object} title    - title info
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

  class Converter {
    /**
     * convertX - convert x value into canvas coords
     *
     * @param  {number} value data value
     * @return {number}       x-coord of the point
     * @param  {object} range mix-max values of source scale
     * @param  {object} limits min-max values of destination scale
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
     * @param  {object} range mix-max values of source scale
     * @param  {object} limits min-max values of destination scale
     * @return {number}       y-coord of the point
     */
    static convertY(value, range, limits) {
      let oldRange = range.maxy - range.miny;
      let newRange = limits.maxy - limits.miny;
      return (((value - range.miny) * newRange) / oldRange) + limits.miny;
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
     * @param  {object} axis     axis parameters
     * @param  {string} direction axis direction - x or y
     * @param  {object} ranges ranges of values
     * @param  {object} data_limits limits of data in canvas coords
     * @param  {object} axis_limits limits of axis in canvas coords
     * @param  {object} categories categories names for a categorical axis
     */
    constructor(canvas, axis, direction, ranges, data_limits, axis_limits, categories) {
      this.canvas = canvas;
      this.axis   = axis;
      this.direction = direction;
      this.ranges = ranges;
      this.data_limits = data_limits,
      this.limits = axis_limits;
      this.zero = {
        'x': Converter.convertX(0, this.ranges, this.limits),
        'y': Converter.convertY(0, this.ranges, this.limits)
      };
      this.categories = categories;
      this.ticks = [];
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

      this.ctx = this.canvas.getContext("2d");

      this.ctx.beginPath();
      this.ctx.strokeStyle = (this.axis.color ? this.axis.color : "#000");
      this.ctx.lineWidth = (this.axis.width ? this.axis.width : 1);
      this.ctx.moveTo(x_start, y_start);
      this.ctx.lineTo(x_end, y_end);
      this.ctx.stroke();

      this.title = new Title(this.canvas, this.axis.title, this.direction)
        .render(title_top);

      if (this.axis.ticks) {
          this.addTicks();
      }

      return this;
    }


    /**
     * addTicks - add ticks to axis
     *
     * @return {void}
     */
    addTicks() {
      this.calcTicksPoints();
      if (this.axis.ticks) {
        this.drawTicks();
        if (this.axis.ticks.labels) {
            this.drawTicksLabels();
        }
      }
    }

    /**
     * calcTicksPoints - calculate positions of ticks
     *
     * @return {void}  - method changes this.ticks property
     */
    calcTicksPoints() {
      this.tickSize = (this.axis.ticks.size ? this.axis.ticks.size : 0);

      this.ticks = [];
      if (this.axis.type == "continuous") {
        let tickStep = (this.axis.ticks && this.axis.ticks.step ? this.axis.ticks.step : 1);

        let point = {"x" : 0, "y" : 0};
        if (this.direction == "x") {
          while (point.x <= this.ranges.maxx) {
            this.ticks.push({
              'x0': Converter.convertX(point.x, this.ranges, this.limits),
              'y0': this.zero.y,
              'x1': Converter.convertX(point.x, this.ranges, this.limits) ,
              'y1': this.zero.y + this.tickSize,
              'label': point.x
            });
            point.x += tickStep;
          }
          point = {"x" : 0, "y" : - tickStep};
          while (point.x >= this.ranges.minx) {
            this.ticks.push({
              'x0': Converter.convertX(point.x, this.ranges, this.limits),
              'y0': this.zero.y,
              'x1': Converter.convertX(point.x, this.ranges, this.limits),
              'y1': this.zero.y + this.tickSize,
              'label': point.x
            });
            point.x -= tickStep;
          }
        } else {
          while (point.y <= this.ranges.maxy) {
            this.ticks.push({
              'x0': this.zero.x,
              'y0': Converter.convertY(point.y, this.ranges, this.limits),
              'x1': this.zero.x - this.tickSize,
              'y1': Converter.convertY(point.y, this.ranges, this.limits),
              'label': point.y
            });
            point.y += tickStep;
          }
          point = {"x" : -tickStep, "y" : 0 };
          while (point.y >= this.ranges.miny) {
            this.ticks.push({
              'x0': this.zero.x,
              'y0': Converter.convertY(point.y, this.ranges, this.limits),
              'x1': this.zero.x - this.tickSize,
              'y1': Converter.convertY(point.y, this.ranges, this.limits),
              'label': point.y
            });
            point.y -= tickStep;
          }
        }
      } else { // categorical axis
        this.ticks = this.categories.map(
          category => {
            let categoryPos = (this.direction == "x" ?
              Converter.convertX(this.categories.indexOf(category), this.ranges, this.data_limits) :
              Converter.convertY(this.categories.indexOf(category), this.ranges, this.data_limits)
            );
            return {
              'x0' : (this.direction == "x" ? categoryPos : this.zero.x),
              'y0' : (this.direction == "x" ? this.zero.y : categoryPos),
              'x1' : (this.direction == "x" ? categoryPos : this.zero.x - this.tickSize),
              'y1' : (this.direction == "x" ? this.zero.y + this.tickSize : categoryPos),
              'label': category
            }
          }
        );
      }
    }

    /**
     * drawTicks - draw calculated ticks
     *
     * @return {void}
     */
    drawTicks() {
      this.ticks.map(
        tick => this.drawTick(
          tick.x0,
          tick.y0,
          tick.x1,
          tick.y1
        )
      );
    }

    /**
     * drawTick - description
     *
     * @param  {number} x0 description
     * @param  {number} y0 description
     * @param  {number} x1 description
     * @param  {number} y1 description
     * @return {void}
     */
    drawTick(x0, y0, x1, y1) {
      this.ctx.beginPath();
      this.ctx.strokeStyle = (this.axis.color ? this.axis.color : "#000");
      this.ctx.lineWidth = 1;
      this.ctx.moveTo(x0, y0);
      this.ctx.lineTo(x1, y1);
      this.ctx.stroke();
    }


    /**
     * drawTicksLabels - add ticks labels to axis
     *
     * @return {void}
     */
    drawTicksLabels() {
      console.log(this.ticks);
      this.ticks.map(
        tick => this.addTickLabel(
          tick.label,
          (this.direction == "x" ? tick.x1 : tick.x1 - 2* this.tickSize),
          (this.direction == "x" ? tick.y1 + 2 * this.tickSize : tick.y1)
        )
      );
    }


    /**
     * addTickLabel - set mark to the label
     *
     * @param  {string} label description
     * @param  {number} x     description
     * @param  {number} y     description
     * @return {void}
     */
    addTickLabel(label, x, y) {
      console.log(label, x, y);
      this.ctx.font = (this.axis.ticks.font ? this.axis.ticks.font : "");
      this.ctx.fillStyle = (this.axis.ticks.color ? this.axis.ticks.color: "#000");
      this.ctx.textAlign = "center";
      this.ctx.fillText(label, x, y);
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
    constructor(series, x_continuous, y_continuous) {
      this.series = series;
      this.x_continuous = x_continuous;
      this.y_continuous = y_continuous;
    }


    /**
     * getRanges - get ranges for the serie of plots
     *
     * @return {object}  mix-max values for x-y entire the series
     */
    getRanges() {
      let ranges = this.series.map(
        plot => this.calcRange(plot)
      );

      return {
        'minx': Math.min(...ranges.map(point => point.minx),0),
        'maxx': Math.max(...ranges.map(point => point.maxx),0),
        'miny': Math.min(...ranges.map(point => point.miny),0),
        'maxy': Math.max(...ranges.map(point => point.maxy),0)
      }
    }


    /**
     * calcRange - calculate min-max values on x-y for the plot
     *
     * @param  {object} plot plot description with data
     * @return {object}      min-max values for x-y
     */
    calcRange(plot) {
        return {
          'minx': (this.x_continuous ?
            Math.min(...plot.data.map(point => point.x)) : 0
          ),
          'maxx': (this.x_continuous ?
            Math.max(...plot.data.map(point => point.x)) : plot.data.length
          ),
          'miny': (this.y_continuous ?
            Math.min(...plot.data.map(point => point.y)) : 0
          ),
          'maxy': (this.y_continuous ?
            Math.max(...plot.data.map(point => point.y)) : plot.data.length
          )
        }
    }
  }

  class DataPoint {
    constructor(x, y, data_x, data_y, value, label, color) {
      this.x = x;
      this.y = y;
      this.data_x = data_x;
      this.data_y = data_y;
      this.label = label;
      this.color = color;
      this.value = value;
    }
  }

  class AbstractPlot {
    /**
     * constructor - create a linear plot
     *
     * @param  {Element} canvas parent canvas element
     * @param  {object} plot   array of data points
     * @param  {object} range common range for the series of plots
     * @param  {object} limits common coords limits for the series of plots
     * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
     * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
     */
    constructor(canvas, plot, range, limits, x_continuous, y_continuous) {
      this.canvas = canvas;
      this.data   = plot.data;
      this.params = plot.params;
      this.range  = range;
      this.limits = limits;
      this.x_continuous = x_continuous;
      this.y_continuous = y_continuous;
    }

    /**
     * convertData - convert data into plot coords
     *
     * @return {array}  array of points in plot's coord system
     */
    convertData() {
      return this.data.map(point => new DataPoint(
        Converter.convertX(
          (this.x_continuous ? point.x : this.data.map(p => p.x).indexOf(point.x)),
          this.range, this.limits
        ),
        Converter.convertY(point.y, this.range, this.limits),
        point.x,
        point.y,
        (point.value ? point.value : 0),
        (point.label ? point.label : ''),
        (point.color ? point.color : '#000')
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
        this.ctx.arc(point.x, point.y,
          this.calcPointRadius(point),
          0, 2 * Math.PI
        );
        this.ctx.fillStyle = this.calcPointColor(point);
        this.ctx.fill();
        this.ctx.lineWidth = 1;
        this.ctx.strokeStyle = this.calcPointColor(point);
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
        this.ctx.fillStyle = ( this.params.labels.color ? this.params.labels.color : "#000" );
        this.ctx.font = (this.params.labels.font ? this.params.labels.font : '');
        if (this.params.labels.type == "xy") {
          this.ctx.fillText(
            `(${point.data_x},${point.data_y})`,
            point.x+10,
            point.y
          );
        } else if (this.params.labels.type == "value") {
          this.ctx.fillText(
            point.value,
            point.x+10,
            point.y
          );
        } else if (this.params.labels.type == "x") {
          this.ctx.fillText(
            point.data_x,
            point.x+10,
            point.y
          );
        } else if (this.params.labels.type == "y") {
          this.ctx.fillText(
            point.data_y,
            point.x+10,
            point.y
          );
        } else if (this.params.labels.type == "label") {
          this.ctx.fillText(
            point.label,
            point.x+10,
            point.y
          );
        }
      });
    }


    /**
     * calcPointRadius - calculate radius of data points
     * @param {object} point - data point
     *
     * @return {number}  radius of the point
     */
    calcPointRadius(point) {
      if (this.params.points.radius) {
        if (this.params.points.radius.type && this.params.points.radius.type == 'fixed') {
          return (this.params.points.radius.value ? this.params.points.radius.value : 0);
        } else if (this.params.points.radius.type && this.params.points.radius.type == 'y') {
          return point.y;
        } else if (this.params.points.radius.type && this.params.points.radius.type == 'value') {
          return point.value;
        } else {
          return point.value;
        }
      }
    }


    /**
     * calcPointColor - calculate point color
     *
     * @param  {object} point data point
     * @return {string}       color value
     */
    calcPointColor(point) {
      if (this.params.points.color) {
        if (this.params.points.color.type && this.params.points.color.type == 'fixed') {
          return (this.params.points.color.color ? this.params.points.color.color : "#000");
        } else {
          return point.color;
        }
      }
    }
  }

  class Linear extends AbstractPlot {

    /**
     * constructor - create a linear plot
     *
     * @param  {Element} canvas parent canvas element
     * @param  {object} plot   array of data points
     * @param  {object} range common range for the series of plots
     * @param  {object} limits common coords limits for the series of plots
     * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
     * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
     */
    constructor(canvas, plot, range, limits, x_continuous, y_continuous) {
      super(canvas, plot, range, limits, x_continuous, y_continuous);
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

      if (this.params.labels) {
        this.addDataValues();
      }

      return this;
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
      this.ctx.strokeStyle = ( this.params.line.color ? this.params.line.color : "#000" );
      this.ctx.lineWidth = (this.params.line.width ? this.params.line.width : 1);
      this.ctx.stroke();
    }

  }

  class BarPlot extends AbstractPlot {
    /**
     * constructor - create a linear plot
     *
     * @param  {Element} canvas parent canvas element
     * @param  {object} plot   array of data points
     * @param  {object} range common range for the series of plots
     * @param  {object} limits common coords limits for the series of plots
     * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
     * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
     * @param  {object} options for all bar plots in series
     */
     constructor(canvas, plot, range, limits, x_continuous, y_continuous, global_options) {
       super(canvas, plot, range, limits, x_continuous, y_continuous);

       this.limits = {...limits};
       this.options = global_options;
     }

     /**
      * render - render a bar plot
      *
      * @return {type}  description
      */
     render() {
       this.correctLimits();

       this.points = this.convertData();

       this.ctx = this.canvas.getContext("2d");

       this.plotBars();

       if (this.params.points) {
         this.addDataPoints();
       }

       if (this.params.labels) {
         this.addDataValues();
       }

       return this;
     }


     /**
      * plotBars - draw bars
      *
      * @return {void}
      */
     plotBars() {
       this.barWidth = this.calcBarWidth();

       this.points.map(
         point => this.drawBar(point)
       );
     }


     /**
      * drawBar - draw a single bar
      *
      * @param  {DataPoint} point point to draw a bar
      * @return {void}
      */
     drawBar(point) {
        if (this.params.bars.type == 'lines') {
          this.ctx.beginPath();
          this.ctx.strokeStyle = ( this.params.line.color ? this.params.line.color : "#000" );
          this.ctx.lineWidth = (this.params.line.width ? this.params.line.width : 1);
          this.ctx.moveTo(point.x, Converter.convertY(0, this.range, this.limits));
          this.ctx.lineTo(point.x, point.y);
          this.ctx.stroke();
        } else {
          this.ctx.beginPath();
          this.ctx.strokeStyle = (this.params.bars.outline && this.params.bars.outline.color ? this.params.bars.outline.color : "#000" );
          this.ctx.lineWidth = (this.params.bars.outline && this.params.bars.outline.width ? this.params.bars.outline.width : 1 );
          this.ctx.moveTo(point.x, Converter.convertY(0, this.range, this.limits));
          this.ctx.lineTo(point.x + this.barWidth, Converter.convertY(0, this.range, this.limits));
          this.ctx.lineTo(point.x + this.barWidth, point.y);
          this.ctx.lineTo(point.x, point.y);
          this.ctx.lineTo(point.x, Converter.convertY(0, this.range, this.limits));
          this.ctx.stroke();
          if (this.params.bars.fill && this.params.bars.fill.type && this.params.bars.fill.type == 'fixed') {
            this.ctx.fillStyle = (this.params.bars.fill.color ? this.params.bars.fill.color : "#fff");
          } else {
            this.ctx.fillStyle = point.color;
          }
          this.ctx.fill();
        }
     }


     /**
      * calcBarWidth - calculate width of bars
      *
      * @return {number}  bar width
      */
     calcBarWidth() {
       if (this.options.width) {
         return this.options.width;
       } else if (this.params.bars.width) {
         return this.params.bars.width;
       } else {
         return (this.limits.maxx - this.limits.minx) / this.data.length - (this.params.bars.gap ? this.params.bars.gap : 0)
       }
     }


     /**
      * correctLimits - correct given limits according bars position
      *
      * @return {void}
      */
     correctLimits() {
       if (this.options.position == 'separated') {
         let groupWidth = (this.limits.maxx - this.limits.minx) / this.options.count;
         this.limits.minx = this.limits.minx + groupWidth * this.options.index;
         this.limits.maxx = this.limits.minx + groupWidth;
       } if (this.options.position == 'together') {
         let barWidth = this.calcBarWidth();
         this.limits.maxx = this.limits.maxx - barWidth * (this.options.count - this.options.index);
         this.limits.minx = this.limits.minx + barWidth * this.options.index;
       }
     }

  }

  class Scatter extends AbstractPlot {
    /**
     * constructor - create a linear plot
     *
     * @param  {Element} canvas parent canvas element
     * @param  {object} plot   array of data points
     * @param  {object} range common range for the series of plots
     * @param  {object} limits common coords limits for the series of plots
     * @param  {bool} x_continuous is x-axis continuous (true) or categorical (false)
     * @param  {bool} y_continuous is y-axis continuous (true) or categorical (false)
     */
    constructor(canvas, plot, range, limits, x_continuous, y_continuous) {
      super(canvas, plot, range, limits, x_continuous, y_continuous);
    }

    /**
     * render - render a scatter plot
     *
     * @return {Linear}  current instance
     */
    render() {
      this.points = this.convertData();

      this.ctx = this.canvas.getContext("2d");

      if (this.params.points) {
        this.addDataPoints();
      }

      if (this.params.labels) {
        this.addDataValues();
      }

      return this;
    }
  }

  class Plot {

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
      this.xCategories = [];
      this.yCategories = [];
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
        this.unifyDataX();
      }

      // calc ranges entire the series
      this.ranges = new Range(
        this.series,
        this.x_continuous,
        this.y_continuous
      ).getRanges();

      // calculate limits
      this.limits = {
        'minx': (this.x_continuous && this.ranges.minx == 0 ? 50 : 60),
        'maxx': this.canvas.width - 60,
        'miny': (this.y_continuous  && this.ranges.miny == 0 ? this.canvas.height - 50 : this.canvas.height - 60),
        'maxy': 60
      };

      this.axis_limits = {
        'minx': (this.x_continuous ? this.limits.minx : 50),
        'maxx': this.canvas.width - 60,
        'miny': (this.y_continuous ? this.limits.miny : this.canvas.height - 50),
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
        new Axis(this.canvas,
          this.axis_x,
          "x",
          this.ranges,
          this.limits,
          this.axis_limits,
          this.xCategories
        ).render();
      }
    }


    /**
     * addAxisY - add y-axis to the plot
     *
     * @return {void}
     */
    addAxisY() {
      if (this.axis_y) {
        new Axis(this.canvas,
          this.axis_y,
          "y",
          this.ranges,
          this.limits,
          this.axis_limits,
          this.yCategories
        ).render();
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
    unifyDataX() {
      // get common list of categories in all series
      let xValues = [].concat(...this.series.map(
        plot => plot.data.map(point => point.x)
      ));

      // get just unique categories for all series
      this.xCategories = [ ...new Set(xValues) ];

      // change data adding categories and reordering data in
      // series 1,2 etc...
      // ... add categories
      this.xCategories.map(
        value => {
          this.series.map(
            plot => {
              let x = plot.data.map(point => point.x);
              if (x.indexOf(value) < 0) {
                plot.data.push({
                  'x': value,
                  'y': 0
                });
              }
            }
          );
        }
      );

      // ... reorder data in series according categories
      this.series.map(
        plot => plot.data.sort(
          (a,b) => {
            return this.xCategories.indexOf(a.x) - this.xCategories.indexOf(b.x);
          }
        )
      );
      // finally: this.series are unified by x
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

  return Graph;

}());
