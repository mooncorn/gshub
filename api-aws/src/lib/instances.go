package lib

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ec2"
	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
)

type Instance struct {
	Id         string
	Type       string
	LaunchTime time.Time
	PublicIp   string
	State      string
}

type InstanceClient struct {
	ec2 *ec2.Client
}

func NewInstanceClient(ctx context.Context) (*InstanceClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return &InstanceClient{}, fmt.Errorf("failed to load AWS config: %v", err)
	}

	return &InstanceClient{ec2: ec2.NewFromConfig(cfg)}, nil
}

func (c *InstanceClient) CreateInstance(ctx context.Context, instanceType types.InstanceType) (*Instance, error) {
	imageId := os.Getenv("AWS_IMAGE_ID_BASE")
	keyName := os.Getenv("AWS_KEY_PAIR_NAME")

	runInstancesInput := &ec2.RunInstancesInput{
		ImageId:      &imageId,
		InstanceType: instanceType,
		MinCount:     aws.Int32(1),
		MaxCount:     aws.Int32(1),
		KeyName:      &keyName,
	}

	result, err := c.ec2.RunInstances(ctx, runInstancesInput)
	if err != nil || len(result.Instances) == 0 {
		return &Instance{}, fmt.Errorf("failed to create instance: %v", err)
	}

	instance := result.Instances[0]

	return &Instance{
		Id:         *instance.InstanceId,
		Type:       string(instance.InstanceType),
		LaunchTime: *instance.LaunchTime,
		State:      string(instance.State.Name),
	}, nil
}

func (c *InstanceClient) GetInstances(ctx context.Context) ([]Instance, error) {
	result, err := c.ec2.DescribeInstances(ctx, &ec2.DescribeInstancesInput{})
	if err != nil {
		return []Instance{}, fmt.Errorf("failed to describe instance: %v", err)
	}

	var instances []Instance

	for _, r := range result.Reservations {
		i := r.Instances[0]

		publicIp := ""
		if i.State.Name == types.InstanceStateNameRunning {
			publicIp = *i.PublicIpAddress
		}

		instances = append(instances, Instance{
			Id:         *i.InstanceId,
			Type:       string(i.InstanceType),
			LaunchTime: *i.LaunchTime,
			State:      string(i.State.Name),
			PublicIp:   publicIp,
		})
	}

	return instances, nil
}

func (c *InstanceClient) GetInstance(ctx context.Context, instanceId string) (*Instance, error) {
	result, err := c.ec2.DescribeInstances(ctx, &ec2.DescribeInstancesInput{
		InstanceIds: []string{instanceId},
	})
	if err != nil || len(result.Reservations) == 0 {
		return &Instance{}, fmt.Errorf("failed to describe instance: %v", err)
	}

	instance := result.Reservations[0].Instances[0]

	publicIp := ""
	if instance.State.Name == types.InstanceStateNameRunning {
		publicIp = *instance.PublicIpAddress
	}

	return &Instance{
		Id:         *instance.InstanceId,
		Type:       string(instance.InstanceType),
		LaunchTime: *instance.LaunchTime,
		State:      string(instance.State.Name),
		PublicIp:   publicIp,
	}, nil
}

func (c *InstanceClient) TerminateInstance(ctx context.Context, instanceId string) (*Instance, error) {
	instance, err := c.GetInstance(ctx, instanceId)
	if err != nil {
		return &Instance{}, err
	}

	_, err = c.ec2.TerminateInstances(ctx, &ec2.TerminateInstancesInput{
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return &Instance{}, fmt.Errorf("failed to terminate instance: %v", err)
	}

	return instance, nil
}

func (c *InstanceClient) UpdateInstance(ctx context.Context, instanceId string, newInstanceType types.InstanceType) (*Instance, error) {
	instance, err := c.GetInstance(ctx, instanceId)
	if err != nil {
		return &Instance{}, err
	}

	// Check if the new instance type is different than the current one
	if instance.Type == string(newInstanceType) {
		return &Instance{}, errors.New("no changes")
	}

	// Check if the instance is stopped to perform the update
	if instance.State != string(types.InstanceStateNameStopped) {
		return &Instance{}, errors.New("stop the instance to update it")
	}

	_, err = c.ec2.ModifyInstanceAttribute(ctx, &ec2.ModifyInstanceAttributeInput{
		InstanceId: &instanceId,
		InstanceType: &types.AttributeValue{
			Value: (*string)(&newInstanceType),
		},
	})
	if err != nil {
		return &Instance{}, fmt.Errorf("failed to modify instance type: %v", err)
	}

	instance.Type = string(newInstanceType)

	return instance, nil
}

func (c *InstanceClient) StartInstance(ctx context.Context, instanceId string) error {
	_, err := c.ec2.StartInstances(ctx, &ec2.StartInstancesInput{
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return err
	}

	return nil
}

func (c *InstanceClient) StopInstance(ctx context.Context, instanceId string) error {
	_, err := c.ec2.StopInstances(ctx, &ec2.StopInstancesInput{
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return err
	}

	return nil
}
