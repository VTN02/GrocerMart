package com.grocersmart.specification;

import com.grocersmart.entity.Supplier;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class SupplierSpecification {
    public static Specification<Supplier> filterBy(String search, Supplier.Status status) {
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
                Predicate emailMatch = cb.like(cb.lower(root.get("email")), pattern);

                predicates.add(cb.or(nameMatch, phoneMatch, publicIdMatch, emailMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
