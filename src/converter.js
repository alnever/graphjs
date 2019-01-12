export class Converter {
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
