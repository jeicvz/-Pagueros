class FigGeo {
  constructor() {
    this._area = 0;
  }

  calcArea() {
    throw new Error("calcArea() debe ser implementado por la subclase.");
  }

  saveArea() {
    if (this._area === 0) {
      console.log("Calculando área...");
      this._area = this.calcArea();
    }
  }

  getArea() {
    return this._area;
  }
}

class IFig {
  area() {
    throw new Error("Método abstracto: area()");
  }
  perimetro() {
    throw new Error("Método abstracto: perimetro()");
  }
  mostrar() {
    throw new Error("Método abstracto: mostrar()");
  }
}

class FigGeoPrinter {
  PrintDetails() {
    throw new Error("Método abstracto: PrintDetails()");
  }
}

class Triangle extends FigGeo {
  constructor(base, altura) {
    super();
    this.base = base;
    this.altura = altura;
  }

  calcArea() {
    return (this.base * this.altura) / 2;
  }

  area() {
    this.saveArea();
    return this.getArea();
  }

  perimetro() {
    return 3 * this.base;
  }

  mostrar() {
    console.log("Triangle:");
    console.log(`Base: ${this.base}, Altura: ${this.altura}`);
    console.log(`Área: ${this._area}`);
    console.log(`Perímetro: ${this.perimetro()}\n`);
  }

  PrintDetails() {
    console.log(
      `[PrintDetails] Triángulo - base = ${this.base}, altura = ${this.altura}, área = ${this._area}`
    );
  }
}

class Circle extends FigGeo {
  constructor(radio) {
    super();
    this.radio = radio;
  }

  calcArea() {
    return Math.PI * this.radio * this.radio;
  }

  area() {
    this.saveArea();
    return this.getArea();
  }

  perimetro() {
    return 2 * Math.PI * this.radio;
  }

  mostrar() {
    console.log("Circle:");
    console.log(`Radio: ${this.radio}`);
    console.log(`Área: ${this._area}`);
    console.log(`Perímetro: ${this.perimetro()}\n`);
  }

  PrintDetails() {
    console.log(
      `[PrintDetails] Círculo - radio = ${this.radio}, área = ${this._area}`
    );
  }
}

class Square extends FigGeo {
  constructor(lado) {
    super();
    this.lado = lado;
  }

  calcArea() {
    return this.lado * this.lado;
  }

  area() {
    this.saveArea();
    return this.getArea();
  }

  perimetro() {
    return 4 * this.lado;
  }

  mostrar() {
    console.log("Square:");
    console.log(`Lado: ${this.lado}`);
    console.log(`Área: ${this._area}`);
    console.log(`Perímetro: ${this.perimetro()}\n`);
  }

  PrintDetails() {
    console.log(
      `[PrintDetails] Cuadrado - lado = ${this.lado}, área = ${this._area}`
    );
  }
}

// Factories
class FigFactory {
  createFig() {
    throw new Error("Método abstracto: createFig()");
  }
}

class TriangleFactory extends FigFactory {
  constructor(base, altura) {
    super();
    this.base = base;
    this.altura = altura;
  }

  createFig() {
    return new Triangle(this.base, this.altura);
  }
}

class CircleFactory extends FigFactory {
  constructor(radio) {
    super();
    this.radio = radio;
  }

  createFig() {
    return new Circle(this.radio);
  }
}

class SquareFactory extends FigFactory {
  constructor(lado) {
    super();
    this.lado = lado;
  }

  createFig() {
    return new Square(this.lado);
  }
}
const factories = [
  new TriangleFactory(3.0, 4.0),
  new CircleFactory(2.5),
  new SquareFactory(5.0),
];

const figuras = factories.map((factory) => factory.createFig());

for (const figura of figuras) {
  figura.area();
  figura.mostrar();
  figura.PrintDetails();
}
