package com.shopstack.service;

/** Thrown for any business-rule failure while placing an order (empty cart, bad payment, etc).
 *  Caught by OrderController and turned into a 400 response with the message intact. */
public class OrderPlacementException extends RuntimeException {
    public OrderPlacementException(String message) {
        super(message);
    }
}