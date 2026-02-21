package com.grocersmart.specification;

import com.grocersmart.entity.CreditCustomer;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class CreditCustomerSpecification {
    public static Specification<CreditCustomer> filterBy(String search, CreditCustomer.Status status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("name")), pattern);
                Predicate phoneMatch = cb.like(cb.lower(root.get("phone")), pattern);
                Predicate publicIdMatch = cb.like(cb.lower(root.get("publicId")), pattern);

                predicates.add(cb.or(nameMatch, phoneMatch, publicIdMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
