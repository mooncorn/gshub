package lib

// import (
// 	"context"
// 	"dasior/cloudservers/src/aws"
// 	"fmt"
// 	"strings"

// 	"github.com/aws/aws-sdk-go-v2/service/ec2/types"
// )

// type Server struct {
// 	ssm *aws.AWSSSMService
// 	ec2 *aws.AWSEC2Service
// }

// type CreateServerConfig struct {
// 	InstanceType types.InstanceType
// 	Image        string   // container image
// 	Env          []string // env vars for example: {"eula=true", "version=latest"}
// 	Volume       string   // "path_to_server_data_in_container"
// 	Ports        []string // ports to bind for example: {"25565:25565", "25566:25570"}
// }

// func NewServer() *Server {
// 	return &Server{
// 		ec2: aws.NewAWSEC2Service(),
// 		ssm: aws.NewAWSSSMService(),
// 	}
// }

// func (s *Server) Create(ctx context.Context, config CreateServerConfig) (string, error) {
// 	instanceId, err := s.ec2.CreateEC2Instance(ctx, &aws.EC2InstanceConfig{
// 		InstanceType: config.InstanceType,
// 	})
// 	if err != nil {
// 		return "", err
// 	}

// 	cmd := buildDockerCommand(config)

// 	output, err := s.ssm.SendCommands(ctx, []string{cmd}, instanceId)
// 	if err != nil {
// 		return "", err
// 	}

// 	return output, nil
// }

// func buildDockerCommand(config CreateServerConfig) string {
// 	// Start with the basic Docker run command
// 	var cmd strings.Builder
// 	cmd.WriteString("docker run -d")

// 	// Append environment variables
// 	for _, env := range config.Env {
// 		cmd.WriteString(fmt.Sprintf(" -e \"%s\"", env))
// 	}

// 	// Append volume if specified
// 	if config.Volume != "" {
// 		cmd.WriteString(fmt.Sprintf(" -v /container-data:%s", config.Volume))
// 	}

// 	// Append port mappings
// 	for _, port := range config.Ports {
// 		cmd.WriteString(fmt.Sprintf(" -p %s", port))
// 	}

// 	// Append the image last
// 	cmd.WriteString(fmt.Sprintf(" %s", config.Image))

// 	return cmd.String()
// }
