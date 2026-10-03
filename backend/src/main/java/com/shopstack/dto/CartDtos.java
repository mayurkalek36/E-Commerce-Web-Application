package com.shopstack.dto;

public class CartDtos {

    public static class AddToCartRequest {
        public Long userId;
        public Long productId;
        public int quantity = 1;
    }

    public static class UpdateQuantityRequest {
        public int quantity;
    }
}
