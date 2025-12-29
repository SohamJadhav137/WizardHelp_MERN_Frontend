const ORDER_STATES = {
    requested: {
        heading: "Status: Requested",
        buyerSub: "Waiting for the seller to review and accept your order request.",
        sellerSub: "A new order request has been received. Please review and accept to begin work.",
        lottie: "https://lottie.host/4ae7abf2-ee0d-47b6-b47f-fdf4e315f157/Bfd6DcTsIv.lottie",
        styleClass: "requested"
    },

    active: {
        heading: "Status: Active (In Progress)",
        buyerSub: "The seller is currently working on your requirements. Sit back and relax!",
        sellerSub: "You are currently working on this order. Deliver the work before the deadline.",
        lottie: "https://lottie.host/af0e1d5b-da53-414a-b34f-d9d23332a42b/KcicHYxUC2.lottie",
        styleClass: "active"
    },

    delivered: {
        heading: "Order Delivered",
        buyerSub: "The seller has submitted the final files. Please review the delivery to complete the order.",
        sellerSub: "You have successfully delivered the order. Waiting for the buyer's response.",
        lottie: "https://lottie.host/7ced4233-345c-4989-890d-740a4dad3fba/731cCGcHv5.lottie",
        styleClass: "delivered"
    },

    revision: {
        heading: "Revision in Progress",
        buyerSub: "You've requested changes. The seller is now updating the work based on your feedback.",
        sellerSub: "The buyer has requested revisions. Please update and re-deliver the work.",
        lottie: "https://lottie.host/revision-refresh.lottie",
        styleClass: "revision"
    },

    declined: {
        heading: "Order Declined",
        buyerSub: "The seller was unable to take this order. Your payment is being processed for a full refund.",
        sellerSub: "You have declined this order. No further action is required.",
        lottie: "https://lottie.host/order-declined.lottie",
        styleClass: "declined"
    },

    reqCancellation: {
        heading: "Cancellation Request",
        byBuyer: {
            buyerSub: "A request to cancel this order has been submitted. Please wait for the seller's response.",
            sellerSub: "The buyer has requested to cancel this order !",
        },
        bySeller: {
            buyerSub: "The seller has requested to cancel this order !",
            sellerSub: "A request to cancel this order has been submitted. Please wait for the buyer's response.",
        },
        lottie: "https://lottie.host/cancellation-warning.lottie",
        styleClass: "cancel-requested"
    },

    cancelled: {
        heading: "Order Cancelled",
        buyerSub: "This order has been officially cancelled. No further action is required.",
        sellerSub: "This order has been officially cancelled. No further action is required.",
        lottie: "https://lottie.host/error-cancel.lottie",
        styleClass: "cancelled"
    },
    completed: {
        heading: "Order Completed",
        buyerSub: "You've accepted the delivery and completed the order. Thank you for working with this seller!",
        sellerSub: "The buyer has accepted the delivery. The order is now complete!",
        lottie: "https://lottie.host/order-completed-success.lottie",
        styleClass: "completed"
    }
};

export default ORDER_STATES;