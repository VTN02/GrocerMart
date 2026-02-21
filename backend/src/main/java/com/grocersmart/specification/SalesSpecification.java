package com.grocersmart.specification;

import com.grocersmart.entity.SalesRecord;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDate;

public class SalesSpecification {

    public static Specification<SalesRecord> filterBy(String search, SalesRecord.PaymentMethod method,
            LocalDate startDate, LocalDate endDate) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (method != null) {
                predicates.add(cb.equal(root.get("paymentMethod"), method));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("salesDate"), startDate));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("salesDate"), endDate));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate invoicePredicate = cb.like(cb.lower(root.get("invoiceId")), searchPattern);
                Predicate publicIdPredicate = cb.like(cb.lower(root.get("publicId")), searchPattern);
                predicates.add(cb.or(invoicePredicate, publicIdPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
