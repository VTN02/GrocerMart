package com.grocersmart.specification;

import com.grocersmart.entity.Cheque;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;

public class ChequeSpecification {
    public static Specification<Cheque> filterBy(String search, Cheque.Status status) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (search != null && !search.isEmpty()) {
                String pattern = "%" + search.toLowerCase() + "%";
                Predicate chequeNumberMatch = cb.like(cb.lower(root.get("chequeNumber")), pattern);
                Predicate bankNameMatch = cb.like(cb.lower(root.get("bankName")), pattern);
                Predicate publicIdMatch = cb.like(cb.lower(root.get("publicId")), pattern);

                predicates.add(cb.or(chequeNumberMatch, bankNameMatch, publicIdMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
