from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from app.models.project import ProjectCreate, ProjectUpdate, ProjectResponse
from app.core.database import get_supabase
from app.core.dependencies import get_current_user_id

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    user_id: str = Depends(get_current_user_id)
):
    """Create a new project"""
    supabase = get_supabase()
    
    new_project = {
        "user_id": user_id,
        "name": project_data.name,
        "description": project_data.description,
        "color": project_data.color
    }
    
    response = supabase.table("projects").insert(new_project).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create project"
        )
    
    return ProjectResponse(**response.data[0])


@router.get("", response_model=List[ProjectResponse])
async def get_projects(user_id: str = Depends(get_current_user_id)):
    """Get all projects for the current user"""
    supabase = get_supabase()
    
    response = supabase.table("projects").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    
    return [ProjectResponse(**project) for project in response.data]


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get a specific project by ID"""
    supabase = get_supabase()
    
    response = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
    
    if not response.data or len(response.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    return ProjectResponse(**response.data[0])


@router.put("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    user_id: str = Depends(get_current_user_id)
):
    """Update a project"""
    supabase = get_supabase()
    
    # Check if project exists and belongs to user
    existing = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
    
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Prepare update data (only include non-None fields)
    update_data = project_data.model_dump(exclude_unset=True)
    
    if not update_data:
        return ProjectResponse(**existing.data[0])
    
    response = supabase.table("projects").update(update_data).eq("id", project_id).execute()
    
    return ProjectResponse(**response.data[0])


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Delete a project"""
    supabase = get_supabase()
    
    # Check if project exists and belongs to user
    existing = supabase.table("projects").select("*").eq("id", project_id).eq("user_id", user_id).execute()
    
    if not existing.data or len(existing.data) == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    supabase.table("projects").delete().eq("id", project_id).execute()
    
    return None
