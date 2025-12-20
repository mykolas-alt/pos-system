package com.ffive.pos_system.dto;

import java.util.List;

import com.ffive.pos_system.model.UserRoleType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class GUIUserInfo implements GUIObject {
    private String username;
    private List<UserRoleType> roles;
    private String name;
    private String email;
    private GUIBusiness business;
}
