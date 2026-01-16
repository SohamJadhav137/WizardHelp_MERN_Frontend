const ORDER_STATES = {
    requested: {
        heading: "Status: Requested",
        buyerSub: "Waiting for seller to review and accept your order request.",
        sellerSub: "A new order request has been received. Please review and accept to begin work.",
        lottie: "/animations/order_requested.lottie",
        styleClass: "requested"
    },

    active: {
        heading: "Order is Active (In Progress)",
        buyerSub: "Seller is currently working on your requirements. Sit back and relax!",
        sellerSub: "You are currently working on this order. Deliver the work before the deadline.",
        lottie: "/animations/order_active.lottie",
        styleClass: "active"
    },

    delivered: {
        heading: "Order Delivered",
        buyerSub: "Seller has submitted the final files. Please review the delivery to complete the order.",
        sellerSub: "You have successfully delivered the order. Waiting for buyer's response.",
        lottie: "/animations/order_delivered.lottie",
        styleClass: "delivered"
    },

    revision: {
        heading: "Revision in Progress",
        buyerSub: "You've requested changes. Seller is now updating the work based on your feedback.",
        sellerSub: "Buyer has requested a revision. Please update and re-deliver the work.",
        lottie: "",
        styleClass: "revision"
    },

    Declined: {
        heading: "Order Declined!",
        buyerSub: "Seller is busy with other orders",
        sellerSub: "You have declined this order",
        lottie: "/animations/order_declined.lottie",
        styleClass: "declined",
        width: '150',
        height: '150'
    },

    "request-cancellation": {
        heading: "Order Cancellation Request",
        byBuyer: {
            buyerSub: "A request to cancel this order has been submitted. Please wait for seller's response.",
            sellerSub: "The buyer has requested to cancel this order !",
        },
        bySeller: {
            buyerSub: "Seller has requested to cancel this order !",
            sellerSub: "A request to cancel this order has been submitted. Please wait for buyer's response.",
        },
        lottie: "/animations/order_cancel_req.lottie",
        styleClass: "req-cancellation"
    },

    cancelled: {
        heading: "Order Cancelled",
        // buyerSub: "This order has been officially cancelled. No further action is required.",
        // sellerSub: "This order has been officially cancelled. No further action is required.",
        byBuyer: {
            buyerSub: "Seller has accepted the order cancellation request. Order was cancelled successfully.",
            sellerSub: "You have accepted the order cancellation request. Order was cancelled successfully.",
        },
        bySeller: {
            buyerSub: "You have accepted the order cancellation request. Order was cancelled successfully.",
            sellerSub: "Buyer has accepted the order cancellation request. Order was cancelled successfully.",
        },
        lottie: "/animations/order_cancelled.lottie",
        styleClass: "cancelled"
    },
    completed: {
        heading: "Order Completed",
        buyerSub: "You've accepted the delivery and completed the order. Thank you for working with this seller!",
        sellerSub: "Buyer has accepted the delivery. The order is now complete and funds will be released!",
        lottie: "/animations/order_completed.lottie",
        styleClass: "completed"
    }
};

export default ORDER_STATES;