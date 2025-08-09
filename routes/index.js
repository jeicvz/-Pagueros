const e = require("express");
var express = require("express");
var router = express.Router();

// Model to register a payment movement
/**
 * Modelo para el movimiento de pago.
 * @class PaymentMovement
 * @property {string} email - Correo electrónico del usuario.
 * @property {number} amount - Monto del pago.
 * @property {string} paymentMethod - Método de pago utilizado.
 * @property {Date} date - Fecha del movimiento de pago.
 * @property {string} status - Estado del movimiento de pago ("Pendiente", "Completado", "Fallido").
 * @property {uuid} id - ID de la transacción del pago.
 */
class PaymentMovement {
  /**
   * @param {string} email - Correo electrónico del usuario.
   * @param {number} amount - Monto del pago.
   * @param {string} paymentMethod - Método de pago utilizado.
   * @param {Date} date - Fecha del movimiento de pago.
   * @param {string} status - Estado del movimiento de pago ("Pendiente", "Completado", "Fallido").
   * @param {string} id - ID de la transacción del pago.
   */
  constructor(email, amount, paymentMethod, date, status, id) {
    this.email = email;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
    this.date = date;
    this.status = status;
    this.id = id;
  }
}

/**
 * Modelo para la solicitud de pago.
 * @class PaymentFormReq
 * @property {string} email - Correo electrónico del usuario.
 * @property {number} amount - Monto a pagar.
 * @property {string} paymentMethod - Método de pago seleccionado.
 */
class PaymentFormReq {
  /**
   * @param {string} email - Correo electrónico del usuario.
   * @param {number} amount - Monto a pagar.
   * @param {string} paymentMethod - Método de pago seleccionado.
   */
  constructor(email, amount, paymentMethod) {
    this.email = email;
    this.amount = amount;
    this.paymentMethod = paymentMethod;
  }
}

/**
 * Modelo para la respuesta del servicio de pago.
 * @class PaymentServiceRes
 * @property {string} msg - Mensaje de respuesta.
 * @property {string} status - Estado de la respuesta ("OK" o "Error").
 */
class PaymentServiceRes {
  /**
   * @param {string} msg - Mensaje de respuesta.
   * @param {string} status - Estado de la respuesta.
   */
  constructor(msg, status) {
    this.msg = msg;
    this.status = status;
  }
}

/*
SERVICE
 ____                  _          
/ ___|  ___ _ ____   _(_) ___ ___ 
\___ \ / _ \ '__\ \ / / |/ __/ _ \
 ___) |  __/ |   \ V /| | (_|  __/
|____/ \___|_|    \_/ |_|\___\___|
*/

/**
 * Interfaz para el servicio de pago.
 * @interface IService
 * @property {IRepository} repository - Repositorio para almacenar los movimientos de pago.
 * @method {PaymentServiceRes} validatePayment - Valida la solicitud de pago.
 * @method {PaymentServiceRes} processPayment - Procesa el pago.
 */
class IService {
  /**
   * Valida la solicitud de pago.
   * @param {PaymentFormReq} paymentFormReq - Solicitud de pago.
   * @returns {PaymentServiceRes}
   * @throws {Error} Si el método no está implementado.
   */
  validatePayment(paymentFormReq) {
    throw new Error("Method 'processPayment' must be implemented.");
  }
  /**
   * Procesa el pago.
   * @param {PaymentFormReq} paymentFormReq - Solicitud de pago.
   * @returns {PaymentServiceRes}
   */
  processPayment(paymentFormReq) {
    throw new Error("Method 'processPayment' must be implemented.");
  }
}

/**
 * Implementación del servicio de pago.
 * @class PaymentService
 * @extends IService
 * @property {IRepository} repository - Repositorio para almacenar los movimientos de pago.
 */
class PaymentService extends IService {
  /**   * Crea una nueva instancia del servicio de pago.
   * @param {IRepository} repository - Repositorio para almacenar los movimientos de pago.
   */
  constructor(repository = new PaymentArrayRepository()) {
    super();
    this.repository = repository;
  }

  /**
   * Valida la solicitud de pago.
   * @param {PaymentFormReq} paymentFormReq - Solicitud de pago.
   * @returns {PaymentServiceRes}
   */
  validatePayment(paymentFormReq) {
    // if the amount is less or equal than 0, return an error response
    if (paymentFormReq.amount <= 0) {
      return new PaymentServiceRes(
        "The amount must be greater than 0",
        "Error"
      );
    } else {
      // if the amount is greater than 0, return a success response
      return new PaymentServiceRes(
        `Payment of ${paymentFormReq.amount} processed successfully using ${paymentFormReq.paymentMethod}`,
        "OK"
      );
    }
  }
  /**
   * Procesa el pago.
   * @param {PaymentFormReq} paymentFormReq - Solicitud de pago.
   * @returns {PaymentServiceRes}
   */
  processPayment(paymentFormReq) {
    // Validate the payment request
    const validationRes = this.validatePayment(paymentFormReq);
    // If validation fails, return the error response
    if (validationRes.status !== "OK") {
      return validationRes;
    }
    // Create a payment instance based on the payment method
    const payment = PaymentFactory.createPayment(paymentFormReq);
    // Process the payment and return the response
    const paymentRes = payment.processPayment();
    this.repository.addPayment(
      new PaymentMovement(
        paymentFormReq.email,
        paymentFormReq.amount,
        paymentFormReq.paymentMethod,
        new Date(),
        paymentRes.status,
        Math.random().toString(36).substring(2, 15) // Generate a random ID for the transaction
      )
    );
    return paymentRes;
  }
}

/*
PAYMENT PROCESSING
 ____                                  _         
|  _ \ __ _ _   _ _ __ ___   ___ _ __ | |_       
| |_) / _` | | | | '_ ` _ \ / _ \ '_ \| __|      
|  __/ (_| | |_| | | | | | |  __/ | | | |_       
|_|__ \__,_|\__, |_| |_| |_|\___|_|_|_|\__|      
|  _ \ _ __ |___/ ___ ___  ___ ___(_)_ __   __ _ 
| |_) | '__/ _ \ / __/ _ \/ __/ __| | '_ \ / _` |
|  __/| | | (_) | (_|  __/\__ \__ \ | | | | (_| |
|_|   |_|  \___/ \___\___||___/___/_|_| |_|\__, |
                                           |___/ 
*/

// Abstract class for creating a payment and extend for the concrete implementation
class Payment {
  /**
   * Creates a new payment.
   * @param {PaymentFormReq} paymentFormReq - The payment request.
   */
  constructor(paymentFormReq) {
    this.paymentFormReq = paymentFormReq;
  }
  // Abstract method to process the payment
  processPayment() {
    throw new Error("Method 'processPayment' must be implemented.");
  }
}

// Concrete implementation of the Payment class for PayPal payments
class PayPalPayment extends Payment {
  processPayment() {
    // Logic to process PayPal payment
    console.log(`Processing PayPal payment for ${this.paymentFormReq.email}`);
    // Simulate a payment processing using a random condition to respond with success or error
    if (Math.random() < 0.5) {
      console.log(
        `PayPal payment of ${this.paymentFormReq.amount} processed successfully`
      );
      return new PaymentServiceRes(
        `PayPal payment of ${this.paymentFormReq.amount} processed successfully`,
        "OK"
      );
    }
    console.error(`PayPal payment failed for ${this.paymentFormReq.email}`);
    return new PaymentServiceRes("PayPal payment failed", "Error");
  }
}

// Concrete implementation of the Payment class for Credit Card payments
class CreditCardPayment extends Payment {
  processPayment() {
    // Logic to process Credit card payment
    console.log(
      `Processing Credit card payment for ${this.paymentFormReq.email}`
    );
    // Simulate a payment processing using a random condition to respond with success or error
    if (Math.random() < 0.8) {
      console.log(
        `Credit card payment of ${this.paymentFormReq.amount} processed successfully`
      );
      return new PaymentServiceRes(
        `Credit card payment of ${this.paymentFormReq.amount} processed successfully`,
        "OK"
      );
    }
    console.error(
      `Credit card payment failed for ${this.paymentFormReq.email}`
    );
    return new PaymentServiceRes("Credit card payment failed", "Error");
  }
}

// Concrete implementation of the Payment class for Bank Transfer payments
class BankTransferPayment extends Payment {
  processPayment() {
    // Logic to process Bank Transfer payment
    console.log(
      `Processing Bank Transfer payment for ${this.paymentFormReq.email}`
    );
    // Simulate a payment processing using a random condition to respond with success or error
    if (Math.random() < 0.95) {
      console.log(
        `Bank Transfer payment of ${this.paymentFormReq.amount} processed successfully`
      );
      return new PaymentServiceRes(
        `Bank Transfer payment of ${this.paymentFormReq.amount} processed successfully`,
        "OK"
      );
    }
    console.error(
      `Bank Transfer payment failed for ${this.paymentFormReq.email}`
    );
    return new PaymentServiceRes("Bank Transfer payment failed", "Error");
  }
}

/*
FACTORY
 _____          _                   
|  ___|_ _  ___| |_ ___  _ __ _   _ 
| |_ / _` |/ __| __/ _ \| '__| | | |
|  _| (_| | (__| || (_) | |  | |_| |
|_|  \__,_|\___|\__\___/|_|   \__, |
                              |___/  
*/

// Factory class to create payment instances based on the payment method
class PaymentFactory {
  /**
   * Creates a payment instance based on the payment method.
   * @param {PaymentFormReq} paymentFormReq - The payment request.
   * @returns {Payment} - The payment instance.
   */
  static createPayment(paymentFormReq) {
    switch (paymentFormReq.paymentMethod) {
      case "paypal":
        return new PayPalPayment(paymentFormReq);
      case "creditCard":
        return new CreditCardPayment(paymentFormReq);
      case "bankTransfer":
        return new BankTransferPayment(paymentFormReq);
      default:
        throw new Error("Unsupported payment method");
    }
  }
}

// Repository to store payment movements
// Interface for the repository
/**
 * Interface for the repository.
 * @interface IRepository
 * @property {Array<PaymentMovement>} payments - Array to store payment movements.
 * @method {void} addPayment - Adds a payment movement to the repository.
 * @method {Array<PaymentMovement>} getPayments - Retrieves all payment movements from the repository.
 */
class IRepository {
  /**
   * Adds a payment movement to the repository.
   * @param {PaymentMovement} payment - The payment movement to add.
   */
  addPayment(payment) {
    throw new Error("Method 'addPayment' must be implemented.");
  }
  /**
   * Retrieves all payment movements from the repository.
   * @returns {Array<PaymentMovement>} - Array of payment movements.
   */
  getPayments() {
    throw new Error("Method 'getPayments' must be implemented.");
  }
}

/**
 * Repository to manage payment movements.
 * @class PaymentRepository
 * @extends IRepository
 * @property {Array<PaymentMovement>} payments - Array to store payment movements.
 */
class PaymentArrayRepository extends IRepository {
  /**
   * Creates a new instance of PaymentRepository.
   */
  constructor() {
    super();
    this.payments = [];
  }
  /**
   * Adds a payment movement to the repository.
   * @param {PaymentMovement} payment - The payment movement to add.
   */
  addPayment(payment) {
    this.payments.push(payment);
  }
  /**
   * Retrieves all payment movements from the repository.
   * @returns {Array<PaymentMovement>} - Array of payment movements.
   */
  getPayments() {
    return this.payments;
  }
}

const PaymentArrayRepo = new PaymentArrayRepository();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

// GET My View page
router.get("/my-page", function (req, res, next) {
  const myData = {
    name: "Sem",
    title: "My Personal site",
    say: "hello!!!",
  };
  res.render("myview", { ...myData });
});

router.get("/payment-form", function (req, res, next) {
  res.render("index", {});
});

router.post("/payment-process", function (req, res, next) {
  // const { email, amount, paymentMethod } = req.body;
  // {
  //   email: "email@email.com",
  //   amount: "100",
  //   paymentMethod: "paypal",
  // }
  console.log(req.body);
  const email = req.body.email;
  const amount = req.body.amount;
  const paymentMethod = req.body.paymentMethod;
  // create a new instance of PaymentFormReq
  const paymentFormReq = new PaymentFormReq(email, amount, paymentMethod);
  // create a new instance of PaymentService
  const paymentService = new PaymentService(PaymentArrayRepo);
  // process the payment
  const paymentServiceRes = paymentService.processPayment(paymentFormReq);
  // if the payment was not successful, return an error response
  if (paymentServiceRes.status !== "OK") {
    return res.render("paymentProcessError", {
      errorMessage: paymentServiceRes.msg,
    });
  }
  res.render("paymentProcessOk", {
    email,
    amount,
    paymentMethod,
    msg: paymentServiceRes.msg,
  });
});

router.get("/payment-history", function (req, res, next) {
  const payments = PaymentArrayRepo.getPayments();
  res.render("paymentHistory", { payments }); // Renderiza la vista con datos
});

router.post("/payment-process", function (req, res, next) {
  console.log(req.body);
  const email = req.body.email;
  const amount = req.body.amount;
  const paymentMethod = req.body.paymentMethod;
  const paymentFormReq = new PaymentFormReq(email, amount, paymentMethod);
  const paymentService = new PaymentService(PaymentArrayRepo);
  const paymentServiceRes = paymentService.processPayment(paymentFormReq);

  if (paymentServiceRes.status !== "OK") {
    return res.render("paymentProcessError", {
      errorMessage: paymentServiceRes.msg,
    });
  }

  res.render("paymentProcessOk", {
    email,
    amount,
    paymentMethod,
    msg: paymentServiceRes.msg,
  });
});

// 👇 ESTA es la línea final correcta del archivo:
module.exports = router;
