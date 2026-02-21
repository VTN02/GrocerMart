package com.grocersmart.specification;

import com.grocersmart.entity.Order;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class OrderSpecification {

    public static Specification<Order> filterBy(String search, Order.Status status, Order.PaymentType paymentType) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (paymentType != null) {
                predicates.add(cb.equal(root.get("paymentType"), paymentType));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate invoicePredicate = cb.like(cb.lower(root.get("invoiceNo")), searchPattern);
                Predicate publicIdPredicate = cb.like(cb.lower(root.get("publicId")), searchPattern);
                predicates.add(cb.or(invoicePredicate, publicIdPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
