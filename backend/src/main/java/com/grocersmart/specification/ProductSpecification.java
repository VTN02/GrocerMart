package com.grocersmart.specification;

import com.grocersmart.entity.Product;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> filterBy(String search, String category, Product.Status status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            } else {
                predicates.add(cb.equal(root.get("status"), Product.Status.ACTIVE));
            }

            if (category != null && !category.isEmpty()) {
                predicates.add(cb.equal(root.get("category"), category));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate namePredicate = cb.like(cb.lower(root.get("name")), searchPattern);
                Predicate publicIdPredicate = cb.like(cb.lower(root.get("publicId")), searchPattern);
                predicates.add(cb.or(namePredicate, publicIdPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
