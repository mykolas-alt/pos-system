
package com.ffive.pos_system.converter.gui;

import org.springframework.stereotype.Component;

import com.ffive.pos_system.dto.GUIEmployee;
import com.ffive.pos_system.model.Employee;

@Component
public class GUIEmployeeConverter {

    public GUIEmployee convertToGUIEmployee(Employee employee) {
        if (employee == null) {
            return null;
        }

        return convertBaseFields(employee).toBuilder()
                .manager(convertBaseFields(employee.getManager()))
                .build();
    }

    private GUIEmployee convertBaseFields(Employee employee) {
        if (employee == null) {
            return null;
        }

        return GUIEmployee.builder()
                .id(employee.getId())
                .name(employee.getName())
                .email(employee.getEmail())
                .build();
    }
}
