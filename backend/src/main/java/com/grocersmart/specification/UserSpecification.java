package com.grocersmart.specification;

import com.grocersmart.entity.User;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filterBy(String search, String role, String status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (role != null && !role.isEmpty()) {
                predicates.add(cb.equal(root.get("role"), role));
            }

            if (status != null && !status.isEmpty()) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isEmpty()) {
                String searchPattern = "%" + search.toLowerCase() + "%";
                Predicate fullNamePredicate = cb.like(cb.lower(root.get("fullName")), searchPattern);
                Predicate usernamePredicate = cb.like(cb.lower(root.get("username")), searchPattern);
                Predicate publicIdPredicate = cb.like(cb.lower(root.get("publicId")), searchPattern);
                predicates.add(cb.or(fullNamePredicate, usernamePredicate, publicIdPredicate));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
