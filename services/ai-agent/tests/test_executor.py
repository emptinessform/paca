"""Tests for executor helpers."""

from src.agent.executor import _build_project_context_suffix


def test_project_id_appears_in_suffix():
    result = _build_project_context_suffix("proj-123")
    assert "proj-123" in result


def test_suffix_instructs_agent_to_pass_project_id():
    result = _build_project_context_suffix("proj-abc")
    assert "projectId" in result


def test_suffix_discourages_list_projects_call():
    result = _build_project_context_suffix("proj-abc")
    assert "list_projects" in result


def test_different_project_ids_produce_different_suffixes():
    assert _build_project_context_suffix("proj-1") != _build_project_context_suffix("proj-2")
