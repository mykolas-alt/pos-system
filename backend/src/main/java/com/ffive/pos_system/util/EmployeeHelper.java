package com.ffive.pos_system.util;

import java.util.Optional;

import com.ffive.pos_system.model.Employee;
import com.ffive.pos_system.model.POSUser;
import com.ffive.pos_system.security.POSUserDetails;

import lombok.experimental.UtilityClass;

@UtilityClass
public class EmployeeHelper {

    public Employee resolveEmployeeFromUserDetails(POSUserDetails userDetails) {
        return Optional.ofNullable(userDetails.getUser())
                .map(POSUser::getEmployee)
                .orElse(null);
    }
}
