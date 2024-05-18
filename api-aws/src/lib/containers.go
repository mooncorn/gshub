package lib

import (
	"context"
	"encoding/json"
	"fmt"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/ssm"
	"github.com/pkg/errors"
)

type ContainerClient struct {
	ssm *ssm.Client
}

type ContainerMount struct {
	Source      string
	Destination string
}

type Container struct {
	Id      string
	Image   string
	Env     []string
	Ports   []string
	Mount   ContainerMount
	Status  string
	Running bool
}

type ContainerOptions struct {
	Image  string   `json:"image"`  // container image
	Env    []string `json:"env"`    // env vars for example: {"eula=true", "version=latest"}
	Volume string   `json:"volume"` // "path_to_server_data_in_container"
	Ports  []string `json:"ports"`  // ports to bind for example: {"25565:25565", "25566:25570"}
}

func NewContainerClient(ctx context.Context) (*ContainerClient, error) {
	cfg, err := config.LoadDefaultConfig(ctx)
	if err != nil {
		return &ContainerClient{}, fmt.Errorf("failed to load AWS config: %v", err)
	}

	return &ContainerClient{
		ssm: ssm.NewFromConfig(cfg),
	}, nil
}

func (c *ContainerClient) GetContainer(ctx context.Context, instanceId string) (*Container, error) {
	result, err := c.ssm.SendCommand(ctx, &ssm.SendCommandInput{
		DocumentName: aws.String("AWS-RunShellScript"),
		Parameters: map[string][]string{
			"commands": {"docker inspect main --format \"{{json .}}\""},
		},
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return &Container{}, fmt.Errorf("failed to send command: %v", err)
	}

	output, err := ssm.NewCommandExecutedWaiter(c.ssm, func(cewo *ssm.CommandExecutedWaiterOptions) {
		cewo.MinDelay = 1
		cewo.MaxDelay = 2
	}).WaitForOutput(ctx, &ssm.GetCommandInvocationInput{
		CommandId:  result.Command.CommandId,
		InstanceId: &instanceId,
	}, 6*time.Second)
	if err != nil {
		if strings.Contains(err.Error(), "Failure") {
			return &Container{}, errors.New("container not found")
		}

		return &Container{}, fmt.Errorf("failed to wait for command output: %v", err)
	}

	var container DockerInspectResult
	json.Unmarshal([]byte(*output.StandardOutputContent), &container)

	portNumbers := []string{}
	for port := range container.Config.ExposedPorts {
		split := strings.Split(port, "/")
		portNumbers = append(portNumbers, split[0])
	}

	return &Container{
		Id:      container.ID,
		Image:   container.Config.Image,
		Env:     container.Config.Env,
		Ports:   portNumbers,
		Status:  container.State.Status,
		Running: container.State.Running,
		Mount: ContainerMount{
			Destination: container.Mounts[0].Destination,
			Source:      container.Mounts[0].Source,
		},
	}, nil
}

func (c *ContainerClient) CreateContainer(ctx context.Context, instanceId string, opts *ContainerOptions) (*Container, error) {
	cmd := buildDockerRunCommand(opts)

	result, err := c.ssm.SendCommand(ctx, &ssm.SendCommandInput{
		DocumentName: aws.String("AWS-RunShellScript"),
		Parameters: map[string][]string{
			"commands": {cmd},
		},
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return &Container{}, fmt.Errorf("failed to send command: %v", err)
	}

	_, err = ssm.NewCommandExecutedWaiter(c.ssm, func(cewo *ssm.CommandExecutedWaiterOptions) {
		cewo.MinDelay = 1
		cewo.MaxDelay = 2
	}).WaitForOutput(ctx, &ssm.GetCommandInvocationInput{
		CommandId:  result.Command.CommandId,
		InstanceId: &instanceId,
	}, 6*time.Second)
	if err != nil {
		return &Container{}, fmt.Errorf("failed to wait for command output: %v", err)
	}

	container, err := c.GetContainer(ctx, instanceId)
	if err != nil {
		return &Container{}, err
	}

	return container, nil
}

func (c *ContainerClient) StartContainer(ctx context.Context, instanceId string) error {
	result, err := c.ssm.SendCommand(ctx, &ssm.SendCommandInput{
		DocumentName: aws.String("AWS-RunShellScript"),
		Parameters: map[string][]string{
			"commands": {"docker start main"},
		},
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return fmt.Errorf("failed to send command: %v", err)
	}

	_, err = ssm.NewCommandExecutedWaiter(c.ssm, func(cewo *ssm.CommandExecutedWaiterOptions) {
		cewo.MinDelay = 1
		cewo.MaxDelay = 2
	}).WaitForOutput(ctx, &ssm.GetCommandInvocationInput{
		CommandId:  result.Command.CommandId,
		InstanceId: &instanceId,
	}, 6*time.Second)
	if err != nil {
		return fmt.Errorf("failed to wait for command output: %v", err)
	}

	return nil
}

func (c *ContainerClient) StopContainer(ctx context.Context, instanceId string) error {
	result, err := c.ssm.SendCommand(ctx, &ssm.SendCommandInput{
		DocumentName: aws.String("AWS-RunShellScript"),
		Parameters: map[string][]string{
			"commands": {"docker stop main"},
		},
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return fmt.Errorf("failed to send command: %v", err)
	}

	_, err = ssm.NewCommandExecutedWaiter(c.ssm, func(cewo *ssm.CommandExecutedWaiterOptions) {
		cewo.MinDelay = 1
		cewo.MaxDelay = 2
	}).WaitForOutput(ctx, &ssm.GetCommandInvocationInput{
		CommandId:  result.Command.CommandId,
		InstanceId: &instanceId,
	}, 6*time.Second)
	if err != nil {
		return fmt.Errorf("failed to wait for command output: %v", err)
	}

	return nil
}

func (c *ContainerClient) RemoveContainer(ctx context.Context, instanceId string) error {
	result, err := c.ssm.SendCommand(ctx, &ssm.SendCommandInput{
		DocumentName: aws.String("AWS-RunShellScript"),
		Parameters: map[string][]string{
			"commands": {"docker stop main", "docker rm main"},
		},
		InstanceIds: []string{instanceId},
	})
	if err != nil {
		return fmt.Errorf("failed to send command: %v", err)
	}

	_, err = ssm.NewCommandExecutedWaiter(c.ssm, func(cewo *ssm.CommandExecutedWaiterOptions) {
		cewo.MinDelay = 1
		cewo.MaxDelay = 2
	}).WaitForOutput(ctx, &ssm.GetCommandInvocationInput{
		CommandId:  result.Command.CommandId,
		InstanceId: &instanceId,
	}, 6*time.Second)
	if err != nil {
		return fmt.Errorf("failed to wait for command output: %v", err)
	}

	return nil
}

func buildDockerRunCommand(opts *ContainerOptions) string {
	// Start with the basic Docker run command
	var cmd strings.Builder
	cmd.WriteString("docker run -d --name main")

	// Append environment variables
	for _, env := range opts.Env {
		cmd.WriteString(fmt.Sprintf(" -e \"%s\"", env))
	}

	// Append volume if specified
	if opts.Volume != "" {
		cmd.WriteString(fmt.Sprintf(" -v %s", opts.Volume))
	}

	// Append port mappings
	for _, port := range opts.Ports {
		cmd.WriteString(fmt.Sprintf(" -p %s", port))
	}

	// Append the image last
	cmd.WriteString(fmt.Sprintf(" %s", opts.Image))

	return cmd.String()
}

type DockerInspectResult struct {
	ID      string    `json:"Id"`
	Created time.Time `json:"Created"`
	Path    string    `json:"Path"`
	Args    []any     `json:"Args"`
	State   struct {
		Status     string    `json:"Status"`
		Running    bool      `json:"Running"`
		Paused     bool      `json:"Paused"`
		Restarting bool      `json:"Restarting"`
		OOMKilled  bool      `json:"OOMKilled"`
		Dead       bool      `json:"Dead"`
		Pid        int       `json:"Pid"`
		ExitCode   int       `json:"ExitCode"`
		Error      string    `json:"Error"`
		StartedAt  time.Time `json:"StartedAt"`
		FinishedAt time.Time `json:"FinishedAt"`
		Health     struct {
			Status        string `json:"Status"`
			FailingStreak int    `json:"FailingStreak"`
			Log           []any  `json:"Log"`
		} `json:"Health"`
	} `json:"State"`
	Image           string `json:"Image"`
	ResolvConfPath  string `json:"ResolvConfPath"`
	HostnamePath    string `json:"HostnamePath"`
	HostsPath       string `json:"HostsPath"`
	LogPath         string `json:"LogPath"`
	Name            string `json:"Name"`
	RestartCount    int    `json:"RestartCount"`
	Driver          string `json:"Driver"`
	Platform        string `json:"Platform"`
	MountLabel      string `json:"MountLabel"`
	ProcessLabel    string `json:"ProcessLabel"`
	AppArmorProfile string `json:"AppArmorProfile"`
	ExecIDs         any    `json:"ExecIDs"`
	HostConfig      struct {
		Binds           any    `json:"Binds"`
		ContainerIDFile string `json:"ContainerIDFile"`
		LogConfig       struct {
			Type   string `json:"Type"`
			Config struct {
			} `json:"Config"`
		} `json:"LogConfig"`
		NetworkMode  string `json:"NetworkMode"`
		PortBindings struct {
			Two5565TCP []struct {
				HostIP   string `json:"HostIp"`
				HostPort string `json:"HostPort"`
			} `json:"25565/tcp"`
		} `json:"PortBindings"`
		RestartPolicy struct {
			Name              string `json:"Name"`
			MaximumRetryCount int    `json:"MaximumRetryCount"`
		} `json:"RestartPolicy"`
		AutoRemove           bool   `json:"AutoRemove"`
		VolumeDriver         string `json:"VolumeDriver"`
		VolumesFrom          any    `json:"VolumesFrom"`
		ConsoleSize          []int  `json:"ConsoleSize"`
		CapAdd               any    `json:"CapAdd"`
		CapDrop              any    `json:"CapDrop"`
		CgroupnsMode         string `json:"CgroupnsMode"`
		DNS                  []any  `json:"Dns"`
		DNSOptions           []any  `json:"DnsOptions"`
		DNSSearch            []any  `json:"DnsSearch"`
		ExtraHosts           any    `json:"ExtraHosts"`
		GroupAdd             any    `json:"GroupAdd"`
		IpcMode              string `json:"IpcMode"`
		Cgroup               string `json:"Cgroup"`
		Links                any    `json:"Links"`
		OomScoreAdj          int    `json:"OomScoreAdj"`
		PidMode              string `json:"PidMode"`
		Privileged           bool   `json:"Privileged"`
		PublishAllPorts      bool   `json:"PublishAllPorts"`
		ReadonlyRootfs       bool   `json:"ReadonlyRootfs"`
		SecurityOpt          any    `json:"SecurityOpt"`
		UTSMode              string `json:"UTSMode"`
		UsernsMode           string `json:"UsernsMode"`
		ShmSize              int    `json:"ShmSize"`
		Runtime              string `json:"Runtime"`
		Isolation            string `json:"Isolation"`
		CPUShares            int    `json:"CpuShares"`
		Memory               int    `json:"Memory"`
		NanoCpus             int    `json:"NanoCpus"`
		CgroupParent         string `json:"CgroupParent"`
		BlkioWeight          int    `json:"BlkioWeight"`
		BlkioWeightDevice    []any  `json:"BlkioWeightDevice"`
		BlkioDeviceReadBps   []any  `json:"BlkioDeviceReadBps"`
		BlkioDeviceWriteBps  []any  `json:"BlkioDeviceWriteBps"`
		BlkioDeviceReadIOps  []any  `json:"BlkioDeviceReadIOps"`
		BlkioDeviceWriteIOps []any  `json:"BlkioDeviceWriteIOps"`
		CPUPeriod            int    `json:"CpuPeriod"`
		CPUQuota             int    `json:"CpuQuota"`
		CPURealtimePeriod    int    `json:"CpuRealtimePeriod"`
		CPURealtimeRuntime   int    `json:"CpuRealtimeRuntime"`
		CpusetCpus           string `json:"CpusetCpus"`
		CpusetMems           string `json:"CpusetMems"`
		Devices              []any  `json:"Devices"`
		DeviceCgroupRules    any    `json:"DeviceCgroupRules"`
		DeviceRequests       any    `json:"DeviceRequests"`
		MemoryReservation    int    `json:"MemoryReservation"`
		MemorySwap           int    `json:"MemorySwap"`
		MemorySwappiness     any    `json:"MemorySwappiness"`
		OomKillDisable       any    `json:"OomKillDisable"`
		PidsLimit            any    `json:"PidsLimit"`
		Ulimits              []struct {
			Name string `json:"Name"`
			Hard int    `json:"Hard"`
			Soft int    `json:"Soft"`
		} `json:"Ulimits"`
		CPUCount           int      `json:"CpuCount"`
		CPUPercent         int      `json:"CpuPercent"`
		IOMaximumIOps      int      `json:"IOMaximumIOps"`
		IOMaximumBandwidth int      `json:"IOMaximumBandwidth"`
		MaskedPaths        []string `json:"MaskedPaths"`
		ReadonlyPaths      []string `json:"ReadonlyPaths"`
	} `json:"HostConfig"`
	GraphDriver struct {
		Data struct {
			LowerDir  string `json:"LowerDir"`
			MergedDir string `json:"MergedDir"`
			UpperDir  string `json:"UpperDir"`
			WorkDir   string `json:"WorkDir"`
		} `json:"Data"`
		Name string `json:"Name"`
	} `json:"GraphDriver"`
	Mounts []struct {
		Type        string `json:"Type"`
		Name        string `json:"Name"`
		Source      string `json:"Source"`
		Destination string `json:"Destination"`
		Driver      string `json:"Driver"`
		Mode        string `json:"Mode"`
		Rw          bool   `json:"RW"`
		Propagation string `json:"Propagation"`
	} `json:"Mounts"`
	Config struct {
		Hostname     string              `json:"Hostname"`
		Domainname   string              `json:"Domainname"`
		User         string              `json:"User"`
		AttachStdin  bool                `json:"AttachStdin"`
		AttachStdout bool                `json:"AttachStdout"`
		AttachStderr bool                `json:"AttachStderr"`
		ExposedPorts map[string]struct{} `json:"ExposedPorts"`
		Tty          bool                `json:"Tty"`
		OpenStdin    bool                `json:"OpenStdin"`
		StdinOnce    bool                `json:"StdinOnce"`
		Env          []string            `json:"Env"`
		Cmd          any                 `json:"Cmd"`
		Healthcheck  struct {
			Test        []string `json:"Test"`
			Interval    int64    `json:"Interval"`
			StartPeriod int64    `json:"StartPeriod"`
			Retries     int      `json:"Retries"`
		} `json:"Healthcheck"`
		Image   string `json:"Image"`
		Volumes struct {
			Data struct {
			} `json:"/data"`
		} `json:"Volumes"`
		WorkingDir string   `json:"WorkingDir"`
		Entrypoint []string `json:"Entrypoint"`
		OnBuild    any      `json:"OnBuild"`
		Labels     struct {
			OrgOpencontainersImageAuthors     string    `json:"org.opencontainers.image.authors"`
			OrgOpencontainersImageCreated     time.Time `json:"org.opencontainers.image.created"`
			OrgOpencontainersImageDescription string    `json:"org.opencontainers.image.description"`
			OrgOpencontainersImageLicenses    string    `json:"org.opencontainers.image.licenses"`
			OrgOpencontainersImageRefName     string    `json:"org.opencontainers.image.ref.name"`
			OrgOpencontainersImageRevision    string    `json:"org.opencontainers.image.revision"`
			OrgOpencontainersImageSource      string    `json:"org.opencontainers.image.source"`
			OrgOpencontainersImageTitle       string    `json:"org.opencontainers.image.title"`
			OrgOpencontainersImageURL         string    `json:"org.opencontainers.image.url"`
			OrgOpencontainersImageVersion     string    `json:"org.opencontainers.image.version"`
		} `json:"Labels"`
		StopSignal string `json:"StopSignal"`
	} `json:"Config"`
	NetworkSettings struct {
		Bridge     string `json:"Bridge"`
		SandboxID  string `json:"SandboxID"`
		SandboxKey string `json:"SandboxKey"`
		Ports      struct {
		} `json:"Ports"`
		HairpinMode            bool   `json:"HairpinMode"`
		LinkLocalIPv6Address   string `json:"LinkLocalIPv6Address"`
		LinkLocalIPv6PrefixLen int    `json:"LinkLocalIPv6PrefixLen"`
		SecondaryIPAddresses   any    `json:"SecondaryIPAddresses"`
		SecondaryIPv6Addresses any    `json:"SecondaryIPv6Addresses"`
		EndpointID             string `json:"EndpointID"`
		Gateway                string `json:"Gateway"`
		GlobalIPv6Address      string `json:"GlobalIPv6Address"`
		GlobalIPv6PrefixLen    int    `json:"GlobalIPv6PrefixLen"`
		IPAddress              string `json:"IPAddress"`
		IPPrefixLen            int    `json:"IPPrefixLen"`
		IPv6Gateway            string `json:"IPv6Gateway"`
		MacAddress             string `json:"MacAddress"`
		Networks               struct {
			Bridge struct {
				IPAMConfig          any    `json:"IPAMConfig"`
				Links               any    `json:"Links"`
				Aliases             any    `json:"Aliases"`
				MacAddress          string `json:"MacAddress"`
				NetworkID           string `json:"NetworkID"`
				EndpointID          string `json:"EndpointID"`
				Gateway             string `json:"Gateway"`
				IPAddress           string `json:"IPAddress"`
				IPPrefixLen         int    `json:"IPPrefixLen"`
				IPv6Gateway         string `json:"IPv6Gateway"`
				GlobalIPv6Address   string `json:"GlobalIPv6Address"`
				GlobalIPv6PrefixLen int    `json:"GlobalIPv6PrefixLen"`
				DriverOpts          any    `json:"DriverOpts"`
				DNSNames            any    `json:"DNSNames"`
			} `json:"bridge"`
		} `json:"Networks"`
	} `json:"NetworkSettings"`
}
