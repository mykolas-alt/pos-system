package com.ffive.pos_system.repository;

import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.ffive.pos_system.model.Business;
import com.ffive.pos_system.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    // @Query("""
    // SELECT e FROM Employee e
    // WHERE e.id = :employeeId AND e.business.id = :businessId
    // """)
    // Optional<Employee> findByIdAndBusiness(@Param("employeeId") UUID employeeId,
    // @Param("businessId") UUID businessId);

    Page<Employee> findAllByBusiness(Business business, Pageable pageable);
    //
    // @Query("""
    // SELECT e FROM Employee e
    // WHERE e.userAccount.id = :userId
    // """)
    // Optional<Employee> findByUserId(@Param("userId") UUID userId);
}
