export class DataPoint {
  constructor(x, y, data_x, data_y, value, label, color) {
    this.x = x;
    this.y = y;
    this.data_x = data_x;
    this.data_y = data_y;
    this.label = label;
    this.color = color;
    this.value = value;
    this.radius = 0;
  }
}
