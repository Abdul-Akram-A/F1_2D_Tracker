package com.f12d.Ingestor.model;

import lombok.Getter;
import lombok.Setter;

import java.util.Date;


@Getter
@Setter
public class CarData {
    private Date date;
    private int session_key;
    private int meeting_key;
    private int driver_number;
    private int x;
    private int y;
    private int z;

}
