/**
 * Client-safe categories & skills API wrappers.
 * For use in "use client" components only.
 */
import { protectedClientFetch, clientFetch, clientMutation, clientDelete } from "../core/client";

export const getCategories = async () => clientFetch("/api/categories");

export const getSkills = async () => clientFetch("/api/skills");

export const createCategory = async (data) => clientMutation("/api/categories", data, "POST");

export const updateCategory = async (id, data) => clientMutation(`/api/categories/${id}`, data, "PUT");

export const deleteCategory = async (id) => clientDelete(`/api/categories/${id}`);

export const createSkill = async (data) => clientMutation("/api/skills", data, "POST");

export const updateSkill = async (id, data) => clientMutation(`/api/skills/${id}`, data, "PUT");

export const deleteSkill = async (id) => clientDelete(`/api/skills/${id}`);