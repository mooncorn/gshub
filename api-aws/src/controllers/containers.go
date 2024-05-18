package controllers

import (
	"dasior/cloudservers/src/lib"
	"net/http"

	"github.com/gin-gonic/gin"
)

func GetContainer(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": "instance id param required"})
	}

	containerClient, err := lib.NewContainerClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	container, err := containerClient.GetContainer(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, *container)
}

func CreateContainer(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	var req lib.ContainerOptions

	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	containerClient, err := lib.NewContainerClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	container, err := containerClient.CreateContainer(ctx, id, &req)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, container)
}

func StartContainer(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	containerClient, err := lib.NewContainerClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	err = containerClient.StartContainer(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	ctx.Status(http.StatusOK)
}

func StopContainer(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	containerClient, err := lib.NewContainerClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	err = containerClient.StopContainer(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	ctx.Status(http.StatusOK)
}

func DeleteContainer(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	containerClient, err := lib.NewContainerClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"status": "error", "message": err.Error()})
		return
	}

	err = containerClient.RemoveContainer(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"status": "error", "message": err.Error()})
		return
	}

	ctx.Status(http.StatusOK)
}
