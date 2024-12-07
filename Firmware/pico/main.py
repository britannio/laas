import machine
import time

class Motor:
    stepms = 10

    # Do be defined by subclasses
    maxpos = 0
    states = []

    def __init__(self, p1, p2, p3, p4, stepms=None):
        self.pins = [p1, p2, p3, p4]

        if stepms is not None:
            self.stepms = stepms

        self._state = 0
        self._pos = 0

    def __repr__(self):
        return '<{} @ {}>'.format(
            self.__class__.__name__,
            self.pos,
        )

    @property
    def pos(self):
        return self._pos

    @classmethod
    def frompins(cls, *pins, **kwargs):
        return cls(*[machine.Pin(pin, machine.Pin.OUT) for pin in pins],
                   **kwargs)

    def reset(self):
        self._pos = 0

    def _step(self, dir):
        state = self.states[self._state]

        for i, val in enumerate(state):
            self.pins[i].value(val)

        self._state = (self._state + dir) % len(self.states)
        self._pos = (self._pos + dir) % self.maxpos

    def step(self, steps):
        dir = 1 if steps >= 0 else -1
        steps = abs(steps)

        for _ in range(steps):
            t_start = time.ticks_ms()

            self._step(dir)

            t_end = time.ticks_ms()
            t_delta = time.ticks_diff(t_end, t_start)
            time.sleep_ms(self.stepms - t_delta)

    def step_until(self, target, dir=None):
        if target < 0 or target > self.maxpos:
            raise ValueError(target)

        if dir is None:
            dir = 1 if target > self._pos else -1
            if abs(target - self._pos) > self.maxpos/2:
                dir = -dir

        while True:
            if self._pos == target:
                break
            self.step(dir)

    def step_until_angle(self, angle, dir=None):
        if angle < 0 or angle > 360:
            raise ValueError(angle)

        target = int(angle / 360 * self.maxpos)
        self.step_until(target, dir=dir)
        
    def step_degrees(self, degrees):
        if degrees < 0 or degrees > 360:
            raise ValueError("Degrees should be between 0 and 360")

        steps_to_take = int(degrees / 360 * self.maxpos)

        # self.zero()  # Ignore the current position, start from zero
        self.step(steps_to_take)

class FullStepMotor(Motor):
    stepms = 5
    maxpos = 2048
    states = [
        [1, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 1],
        [1, 0, 0, 1],
    ]


class HalfStepMotor(Motor):
    stepms = 3
    maxpos = 4096
    states = [
        [1, 0, 0, 0],
        [1, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 1],
        [0, 0, 0, 1],
        [1, 0, 0, 1],
    ]

# Configure pin 25 (onboard LED) as an output
led = machine.Pin(16, machine.Pin.OUT)
motor_a = machine.Pin(14, machine.Pin.OUT)
motor_b = machine.Pin(15, machine.Pin.OUT)

xAxis = machine.ADC(machine.Pin(27))
yAxis = machine.ADC(machine.Pin(26))

# Initialize the stepper motor
stepper_x = HalfStepMotor.frompins(5, 4, 3, 2)
stepper_y = HalfStepMotor.frompins(9, 8, 7, 6)

# Set the current position as position 0
stepper_x.reset()
stepper_y.reset()

# Set up PWM Pin for servo control
servo_pin = machine.Pin(0)
servo = machine.PWM(servo_pin)

# Set Duty Cycle for Different Angles
max_duty = 7864
min_duty = 1802
duty_range = max_duty - min_duty

def map_duty(x):
    return int((x / 65535) * duty_range + min_duty)

stepper_speed = 100
#Set PWM frequency
frequency = 50
servo.freq (frequency)

try:
    while True:
        # #Move 500 steps in clockwise direction
        # stepper_x.step(-4000)
        # time.sleep(0.5) # stop for a while
        
        # # Move 500 steps in counterclockwise direction
        # stepper_x.step(4000)
        xValue = xAxis.read_u16()
        yValue = yAxis.read_u16()
        print(str(xValue) +", " + str(yValue))

        servo.duty_u16(map_duty(xValue))
        # servo.duty_u16(min_duty)
        # time.sleep(1)
        # servo.duty_u16(max_duty)
        # time.sleep(1)

        # if xValue <= 600:
        #     stepper_x.step(stepper_speed)
        # elif xValue >= 60000:
        #     stepper_x.step(-stepper_speed)
        if yValue <= 600:
            stepper_y.step(stepper_speed)
        elif yValue >= 60000:
            stepper_y.step(-stepper_speed)
        # time.sleep(0.1) # stop for a while     #
        led.toggle()   
      
except KeyboardInterrupt:
    print("Keyboard interrupt")
    # Turn off PWM 
    servo.deinit()