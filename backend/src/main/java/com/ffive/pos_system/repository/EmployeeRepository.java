package com.ffive.pos_system.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ffive.pos_system.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    // @Query("""
    // SELECT e FROM Employee e
    // WHERE e.id = :employeeId AND e.business.id = :businessId
    // """)
    // Optional<Employee> findByIdAndBusiness(@Param("employeeId") UUID employeeId,
    // @Param("businessId") UUID businessId);
    //
    // @Query("""
    // SELECT e FROM Employee e
    // WHERE e.business.id = :businessId
    // """)
    // List<Employee> findAllByBusiness(@Param("businessId") UUID businessId);
    //
    // @Query("""
    // SELECT e FROM Employee e
    // WHERE e.userAccount.id = :userId
    // """)
    // Optional<Employee> findByUserId(@Param("userId") UUID userId);
}
