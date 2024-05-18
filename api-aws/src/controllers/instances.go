package controllers

import (
	"fmt"
	"net/http"
	"strings"

	"dasior/cloudservers/src/lib"

	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
	"github.com/gin-gonic/gin"
)

var AllowedInstanceTypes = map[string]types.InstanceType{
	"t2.micro":  types.InstanceTypeT2Micro,
	"t2.small":  types.InstanceTypeT2Small,
	"t2.medium": types.InstanceTypeT2Medium,
	"t3.micro":  types.InstanceTypeT3Micro,
	"t3.small":  types.InstanceTypeT3Small,
	"t3.medium": types.InstanceTypeT3Medium,
}

func GetInstances(ctx *gin.Context) {
	userID := ctx.MustGet("user_id").(string)
	fmt.Println(userID)

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create instance client"})
		return
	}

	instances, err := instanceClient.GetInstances(ctx)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to get instances"})
		return
	}

	ctx.JSON(http.StatusOK, instances)
}

func GetInstance(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create instance client"})
		return
	}

	instance, err := instanceClient.GetInstance(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to get instance"})
		return
	}

	ctx.JSON(http.StatusOK, *instance)
}

func CreateInstance(ctx *gin.Context) {
	// Validate request body format
	var req struct {
		InstanceType string `json:"instanceType"`
	}

	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Validate instance type
	instanceType, ok := AllowedInstanceTypes[strings.ToLower(req.InstanceType)]
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid instance type"})
		return
	}

	// Create new instance in aws
	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "could not create instance client"})
		return
	}

	instance, err := instanceClient.CreateInstance(ctx, instanceType)
	if err != nil {
		fmt.Println(err)
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "could not create instance"})
		return
	}

	ctx.JSON(http.StatusOK, *instance)
}

func DeleteInstance(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create new instance client"})
		return
	}

	instance, err := instanceClient.TerminateInstance(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete instance"})
		return
	}

	ctx.JSON(http.StatusOK, instance)
}

func StartInstance(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create instance client"})
		return
	}

	err = instanceClient.StartInstance(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to start instance"})
		return
	}

	ctx.Status(http.StatusOK)
}

func StopInstance(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create instance client"})
		return
	}

	err = instanceClient.StopInstance(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "failed to stop instance"})
		return
	}

	ctx.Status(http.StatusOK)
}

func UpdateInstance(ctx *gin.Context) {
	id, ok := ctx.Params.Get("id")
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "instance id param required"})
	}

	// Validate request body format
	var req struct {
		InstanceType string `json:"instanceType"`
	}

	if err := ctx.BindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}

	// Validate instance type
	instanceType, ok := AllowedInstanceTypes[strings.ToLower(req.InstanceType)]
	if !ok {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid instance type"})
		return
	}

	instanceClient, err := lib.NewInstanceClient(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create new instance client"})
		return
	}

	instance, err := instanceClient.UpdateInstance(ctx, id, instanceType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update instance"})
		return
	}

	ctx.JSON(http.StatusOK, instance)
}
